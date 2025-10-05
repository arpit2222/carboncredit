import { ethers } from 'ethers';
import { Connex } from '@vechain/connex';

/**
 * VeChain-specific helper utilities
 * Provides common functions for VeChain network interactions
 */

export interface VeChainConfig {
  chainId: number;
  rpcUrl: string;
  sponsorUrl?: string;
  explorerUrl: string;
}

export const VECHAIN_NETWORKS = {
  TESTNET: {
    chainId: 100010,
    rpcUrl: 'https://testnet.vechain.org',
    sponsorUrl: 'https://sponsor-testnet.vechain.energy/by/269',
    explorerUrl: 'https://explore-testnet.vechain.org'
  },
  MAINNET: {
    chainId: 100009,
    rpcUrl: 'https://mainnet.vechain.org',
    sponsorUrl: 'https://sponsor.vechain.energy/by/269',
    explorerUrl: 'https://explore.vechain.org'
  }
};

/**
 * VeChain Network Manager
 * Handles network-specific configurations and utilities
 */
export class VeChainNetworkManager {
  private config: VeChainConfig;
  private connex: Connex;

  constructor(config: VeChainConfig, connex: Connex) {
    this.config = config;
    this.connex = connex;
  }

  /**
   * Get network configuration
   */
  getConfig(): VeChainConfig {
    return this.config;
  }

  /**
   * Get Connex instance
   */
  getConnex(): Connex {
    return this.connex;
  }

  /**
   * Check if current network is VeChain testnet
   */
  isTestnet(): boolean {
    return this.config.chainId === VECHAIN_NETWORKS.TESTNET.chainId;
  }

  /**
   * Check if current network is VeChain mainnet
   */
  isMainnet(): boolean {
    return this.config.chainId === VECHAIN_NETWORKS.MAINNET.chainId;
  }

  /**
   * Get explorer URL for a transaction
   */
  getTransactionUrl(txId: string): string {
    return `${this.config.explorerUrl}/transactions/${txId}`;
  }

  /**
   * Get explorer URL for an address
   */
  getAddressUrl(address: string): string {
    return `${this.config.explorerUrl}/accounts/${address}`;
  }

  /**
   * Get explorer URL for a block
   */
  getBlockUrl(blockId: string | number): string {
    return `${this.config.explorerUrl}/blocks/${blockId}`;
  }
}

/**
 * VeChain Wallet Utilities
 * Provides wallet-related helper functions
 */
export class VeChainWalletUtils {
  /**
   * Create a wallet from private key
   * @param privateKey Private key (with or without 0x prefix)
   * @returns Ethers wallet instance
   */
  static createWallet(privateKey: string): ethers.Wallet {
    // Ensure private key has 0x prefix
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    return new ethers.Wallet(formattedKey);
  }

  /**
   * Create a wallet from mnemonic
   * @param mnemonic Mnemonic phrase
   * @param index Derivation index (default: 0)
   * @returns Ethers wallet instance
   */
  static createWalletFromMnemonic(mnemonic: string, index: number = 0): ethers.Wallet {
    return ethers.Wallet.fromMnemonic(mnemonic, `m/44'/818'/0'/0/${index}`);
  }

  /**
   * Validate VeChain address
   * @param address Address to validate
   * @returns Whether address is valid
   */
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Get address checksum
   * @param address Address to checksum
   * @returns Checksummed address
   */
  static getChecksumAddress(address: string): string {
    return ethers.getAddress(address);
  }

  /**
   * Get wallet balance in VET
   * @param wallet Wallet instance
   * @param provider Provider instance
   * @returns Balance in VET
   */
  static async getVETBalance(wallet: ethers.Wallet, provider: ethers.Provider): Promise<string> {
    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get wallet balance in VTHO
   * @param wallet Wallet instance
   * @param connex Connex instance
   * @returns Balance in VTHO
   */
  static async getVTHOBalance(wallet: ethers.Wallet, connex: Connex): Promise<string> {
    try {
      const account = connex.thor.account(wallet.address);
      const energy = await account.get();
      return ethers.formatEther(energy.energy || '0');
    } catch (error) {
      console.error('Error getting VTHO balance:', error);
      return '0';
    }
  }
}

/**
 * VeChain Transaction Utilities
 * Provides transaction-related helper functions
 */
export class VeChainTransactionUtils {
  /**
   * Wait for transaction confirmation
   * @param txId Transaction ID
   * @param connex Connex instance
   * @param confirmations Number of confirmations to wait for (default: 1)
   * @returns Transaction receipt
   */
  static async waitForConfirmation(
    txId: string,
    connex: Connex,
    confirmations: number = 1
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkConfirmation = async () => {
        try {
          const tx = connex.thor.transaction(txId);
          const receipt = await tx.getReceipt();
          
          if (receipt && receipt.gasUsed > 0) {
            resolve(receipt);
          } else {
            setTimeout(checkConfirmation, 2000); // Check again in 2 seconds
          }
        } catch (error) {
          reject(error);
        }
      };

      checkConfirmation();
    });
  }

  /**
   * Get transaction status
   * @param txId Transaction ID
   * @param connex Connex instance
   * @returns Transaction status
   */
  static async getTransactionStatus(txId: string, connex: Connex): Promise<{
    exists: boolean;
    confirmed: boolean;
    gasUsed?: number;
    reverted?: boolean;
  }> {
    try {
      const tx = connex.thor.transaction(txId);
      const receipt = await tx.getReceipt();
      
      return {
        exists: true,
        confirmed: receipt && receipt.gasUsed > 0,
        gasUsed: receipt?.gasUsed,
        reverted: receipt?.reverted || false
      };
    } catch (error) {
      return {
        exists: false,
        confirmed: false
      };
    }
  }

  /**
   * Estimate gas for a transaction
   * @param transaction Transaction object
   * @param connex Connex instance
   * @returns Estimated gas
   */
  static async estimateGas(transaction: any, connex: Connex): Promise<number> {
    try {
      const tx = connex.thor.transaction(transaction);
      const result = await tx.estimateGas();
      return result.totalGas;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return 21000; // Fallback to minimum gas
    }
  }
}

/**
 * VeChain Contract Utilities
 * Provides contract interaction helper functions
 */
export class VeChainContractUtils {
  /**
   * Create contract instance with Connex
   * @param contractAddress Contract address
   * @param abi Contract ABI
   * @param connex Connex instance
   * @returns Contract instance
   */
  static createContract(
    contractAddress: string,
    abi: any[],
    connex: Connex
  ): any {
    return connex.thor.account(contractAddress);
  }

  /**
   * Call contract method (read-only)
   * @param contract Contract instance
   * @param methodName Method name
   * @param params Method parameters
   * @returns Method result
   */
  static async callMethod(
    contract: any,
    methodName: string,
    params: any[] = []
  ): Promise<any> {
    try {
      const method = contract.method({
        name: methodName,
        type: 'function',
        constant: true,
        inputs: [],
        outputs: []
      });

      const result = await method.call(...params);
      return result;
    } catch (error) {
      console.error(`Error calling method ${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Send contract transaction
   * @param contract Contract instance
   * @param methodName Method name
   * @param params Method parameters
   * @param wallet Wallet for signing
   * @returns Transaction result
   */
  static async sendTransaction(
    contract: any,
    methodName: string,
    params: any[],
    wallet: ethers.Wallet
  ): Promise<any> {
    try {
      const method = contract.method({
        name: methodName,
        type: 'function',
        constant: false,
        inputs: [],
        outputs: []
      });

      const clause = method.asClause(...params);
      const transaction = {
        clauses: [clause],
        gas: 500000, // Default gas limit
        gasPrice: '0x0' // Use current gas price
      };

      const signedTx = await wallet.signTransaction(transaction);
      const result = await contract.connex.thor.transaction(signedTx).send();
      
      return result;
    } catch (error) {
      console.error(`Error sending transaction ${methodName}:`, error);
      throw error;
    }
  }
}

/**
 * Utility functions for VeChain development
 */
export const VeChainUtils = {
  /**
   * Create network manager for testnet
   * @param connex Connex instance
   * @returns VeChainNetworkManager for testnet
   */
  createTestnetManager: (connex: Connex): VeChainNetworkManager => {
    return new VeChainNetworkManager(VECHAIN_NETWORKS.TESTNET, connex);
  },

  /**
   * Create network manager for mainnet
   * @param connex Connex instance
   * @returns VeChainNetworkManager for mainnet
   */
  createMainnetManager: (connex: Connex): VeChainNetworkManager => {
    return new VeChainNetworkManager(VECHAIN_NETWORKS.MAINNET, connex);
  },

  /**
   * Format VET amount for display
   * @param amount Amount in wei
   * @param decimals Number of decimal places (default: 4)
   * @returns Formatted amount string
   */
  formatVET: (amount: string | bigint, decimals: number = 4): string => {
    const formatted = ethers.formatEther(amount);
    const num = parseFloat(formatted);
    return num.toFixed(decimals);
  },

  /**
   * Format VTHO amount for display
   * @param amount Amount in wei
   * @param decimals Number of decimal places (default: 2)
   * @returns Formatted amount string
   */
  formatVTHO: (amount: string | bigint, decimals: number = 2): string => {
    const formatted = ethers.formatEther(amount);
    const num = parseFloat(formatted);
    return num.toFixed(decimals);
  },

  /**
   * Convert VET to wei
   * @param vetAmount VET amount as string
   * @returns Amount in wei
   */
  parseVET: (vetAmount: string): bigint => {
    return ethers.parseEther(vetAmount);
  },

  /**
   * Convert VTHO to wei
   * @param vthoAmount VTHO amount as string
   * @returns Amount in wei
   */
  parseVTHO: (vthoAmount: string): bigint => {
    return ethers.parseEther(vthoAmount);
  }
};

export default VeChainNetworkManager;
