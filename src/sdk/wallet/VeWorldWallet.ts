import { ethers } from 'ethers';
import { Connex } from '@vechain/connex';

/**
 * VeWorld Wallet Integration
 * Handles wallet connection and transaction signing with VeWorld
 */

export interface VeWorldWalletConfig {
  network: 'testnet' | 'mainnet' | 'solo';
  connex: Connex;
}

export interface WalletConnectionResult {
  address: string;
  publicKey: string;
  isConnected: boolean;
  network: string;
}

export interface TransactionResult {
  txid: string;
  gasUsed: number;
  blockNumber: number;
  timestamp: number;
}

export class VeWorldWallet {
  private config: VeWorldWalletConfig;
  private isConnected: boolean = false;
  private userAddress: string = '';
  private publicKey: string = '';

  constructor(config: VeWorldWalletConfig) {
    this.config = config;
  }

  /**
   * Check if VeWorld is available
   */
  static isVeWorldAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.vechain !== undefined && 
           window.vechain.isVeWorld === true;
  }

  /**
   * Connect to VeWorld wallet
   */
  async connect(): Promise<WalletConnectionResult> {
    if (!VeWorldWallet.isVeWorldAvailable()) {
      throw new Error('VeWorld wallet not available. Please install VeWorld extension.');
    }

    try {
      // Request connection to VeWorld
      const result = await window.vechain.request({
        method: 'vechain_requestAccounts',
        params: []
      });

      if (result && result.length > 0) {
        this.userAddress = result[0];
        this.isConnected = true;

        // Get public key
        const publicKeyResult = await window.vechain.request({
          method: 'vechain_getPublicKey',
          params: [this.userAddress]
        });

        this.publicKey = publicKeyResult;

        console.log('✅ VeWorld wallet connected successfully');
        console.log(`📍 Address: ${this.userAddress}`);
        console.log(`🔑 Public Key: ${this.publicKey}`);

        return {
          address: this.userAddress,
          publicKey: this.publicKey,
          isConnected: this.isConnected,
          network: this.config.network
        };
      } else {
        throw new Error('No accounts returned from VeWorld');
      }
    } catch (error) {
      console.error('❌ Failed to connect to VeWorld wallet:', error);
      throw new Error(`Failed to connect to VeWorld: ${error.message}`);
    }
  }

  /**
   * Disconnect from VeWorld wallet
   */
  async disconnect(): Promise<void> {
    try {
      // VeWorld doesn't have a specific disconnect method
      // We'll just clear our local state
      this.isConnected = false;
      this.userAddress = '';
      this.publicKey = '';

      console.log('✅ VeWorld wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect from VeWorld wallet:', error);
      throw error;
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): WalletConnectionResult {
    return {
      address: this.userAddress,
      publicKey: this.publicKey,
      isConnected: this.isConnected,
      network: this.config.network
    };
  }

  /**
   * Get account balance in VET
   */
  async getVETBalance(): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.config.connex.thor.account(this.userAddress).get();
      return ethers.formatEther(balance.balance);
    } catch (error) {
      console.error('❌ Failed to get VET balance:', error);
      throw error;
    }
  }

  /**
   * Get account balance in VTHO
   */
  async getVTHOBalance(): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const balance = await this.config.connex.thor.account(this.userAddress).get();
      return ethers.formatEther(balance.energy);
    } catch (error) {
      console.error('❌ Failed to get VTHO balance:', error);
      throw error;
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction(transaction: {
    clauses: any[];
    gas?: number;
    gasPrice?: string;
  }): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Prepare transaction for VeWorld
      const tx = {
        clauses: transaction.clauses,
        gas: transaction.gas || 500000,
        gasPrice: transaction.gasPrice || '0x0'
      };

      // Sign transaction with VeWorld
      const result = await window.vechain.request({
        method: 'vechain_sendTransaction',
        params: [tx]
      });

      console.log('✅ Transaction signed successfully');
      console.log(`📝 Transaction ID: ${result.txid}`);

      return result.txid;
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await window.vechain.request({
        method: 'vechain_signMessage',
        params: [message, this.userAddress]
      });

      console.log('✅ Message signed successfully');
      return result.signature;
    } catch (error) {
      console.error('❌ Failed to sign message:', error);
      throw new Error(`Failed to sign message: ${error.message}`);
    }
  }

  /**
   * Send transaction and wait for confirmation
   */
  async sendTransaction(transaction: {
    clauses: any[];
    gas?: number;
    gasPrice?: string;
  }): Promise<TransactionResult> {
    if (!this.isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      // Sign and send transaction
      const txid = await this.signTransaction(transaction);

      // Wait for transaction confirmation
      const receipt = await this.waitForTransaction(txid);

      console.log('✅ Transaction confirmed successfully');
      console.log(`📝 Transaction ID: ${txid}`);
      console.log(`⛽ Gas Used: ${receipt.gasUsed}`);
      console.log(`📦 Block Number: ${receipt.blockNumber}`);

      return {
        txid,
        gasUsed: receipt.gasUsed,
        blockNumber: receipt.blockNumber,
        timestamp: receipt.timestamp
      };
    } catch (error) {
      console.error('❌ Failed to send transaction:', error);
      throw error;
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txid: string, timeout: number = 60000): Promise<{
    gasUsed: number;
    blockNumber: number;
    timestamp: number;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await this.config.connex.thor.transaction(txid).getReceipt();
        
        if (receipt) {
          return {
            gasUsed: receipt.gasUsed,
            blockNumber: receipt.meta.blockNumber,
            timestamp: receipt.meta.blockTimestamp
          };
        }
      } catch (error) {
        // Transaction not yet confirmed, continue waiting
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(txid: string): Promise<any> {
    try {
      const receipt = await this.config.connex.thor.transaction(txid).getReceipt();
      return receipt;
    } catch (error) {
      console.error('❌ Failed to get transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txid: string): Promise<any> {
    try {
      const tx = await this.config.connex.thor.transaction(txid).get();
      return tx;
    } catch (error) {
      console.error('❌ Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * Switch network
   */
  async switchNetwork(network: 'testnet' | 'mainnet' | 'solo'): Promise<void> {
    try {
      const networkConfig = this.getNetworkConfig(network);
      
      await window.vechain.request({
        method: 'vechain_requestNetwork',
        params: [networkConfig]
      });

      this.config.network = network;
      console.log(`✅ Switched to ${network} network`);
    } catch (error) {
      console.error('❌ Failed to switch network:', error);
      throw new Error(`Failed to switch network: ${error.message}`);
    }
  }

  /**
   * Get network configuration
   */
  private getNetworkConfig(network: 'testnet' | 'mainnet' | 'solo') {
    const configs = {
      testnet: {
        chainId: '0x186a0', // 100010
        chainName: 'VeChain Testnet',
        rpcUrls: ['https://testnet.veblocks.net'],
        blockExplorerUrls: ['https://explore-testnet.vechain.org']
      },
      mainnet: {
        chainId: '0x186a1', // 100009
        chainName: 'VeChain Mainnet',
        rpcUrls: ['https://mainnet.veblocks.net'],
        blockExplorerUrls: ['https://explore.vechain.org']
      },
      solo: {
        chainId: '0x186a2', // 100011
        chainName: 'VeChain Solo',
        rpcUrls: ['https://solo.veblocks.net'],
        blockExplorerUrls: ['https://solo-explore.vechain.org']
      }
    };

    return configs[network];
  }

  /**
   * Get current network
   */
  async getCurrentNetwork(): Promise<string> {
    try {
      const result = await window.vechain.request({
        method: 'vechain_getNetwork',
        params: []
      });

      return result.chainId;
    } catch (error) {
      console.error('❌ Failed to get current network:', error);
      throw error;
    }
  }

  /**
   * Check if wallet is locked
   */
  async isWalletLocked(): Promise<boolean> {
    try {
      const result = await window.vechain.request({
        method: 'vechain_isLocked',
        params: []
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to check wallet lock status:', error);
      return true; // Assume locked if we can't check
    }
  }

  /**
   * Request wallet unlock
   */
  async requestUnlock(): Promise<void> {
    try {
      await window.vechain.request({
        method: 'vechain_requestUnlock',
        params: []
      });

      console.log('✅ Wallet unlocked successfully');
    } catch (error) {
      console.error('❌ Failed to unlock wallet:', error);
      throw new Error(`Failed to unlock wallet: ${error.message}`);
    }
  }

  /**
   * Get wallet version
   */
  async getWalletVersion(): Promise<string> {
    try {
      const result = await window.vechain.request({
        method: 'vechain_getVersion',
        params: []
      });

      return result.version;
    } catch (error) {
      console.error('❌ Failed to get wallet version:', error);
      return 'Unknown';
    }
  }

  /**
   * Listen for account changes
   */
  onAccountChange(callback: (address: string) => void): void {
    if (typeof window !== 'undefined' && window.vechain) {
      window.vechain.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          this.userAddress = accounts[0];
          callback(accounts[0]);
        } else {
          this.isConnected = false;
          this.userAddress = '';
          callback('');
        }
      });
    }
  }

  /**
   * Listen for network changes
   */
  onNetworkChange(callback: (network: string) => void): void {
    if (typeof window !== 'undefined' && window.vechain) {
      window.vechain.on('networkChanged', (network: any) => {
        this.config.network = network.chainId === '0x186a0' ? 'testnet' : 
                             network.chainId === '0x186a1' ? 'mainnet' : 'solo';
        callback(this.config.network);
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(): void {
    if (typeof window !== 'undefined' && window.vechain) {
      window.vechain.removeAllListeners();
    }
  }
}

// Extend Window interface for VeWorld
declare global {
  interface Window {
    vechain?: {
      isVeWorld: boolean;
      request: (params: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeAllListeners: () => void;
    };
  }
}

export default VeWorldWallet;
