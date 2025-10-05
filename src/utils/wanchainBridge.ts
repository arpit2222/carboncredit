import { ethers } from 'ethers';
import { Connex } from '@vechain/connex';

/**
 * Wanchain XFlows Bridge Integration
 * Enables cross-chain carbon credit transfers between VeChain and other blockchains
 */

export interface BridgeConfig {
  apiUrl: string;
  chainId: number;
  contractAddress: string;
  apiKey?: string;
}

export interface SupportedToken {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  isNative: boolean;
  chainId: number;
}

export interface BridgeQuote {
  fromChainId: number;
  toChainId: number;
  tokenAddress: string;
  amount: string;
  estimatedTime: number; // in minutes
  fee: string;
  feeToken: string;
  slippage: number;
  quoteId: string;
  expiresAt: number;
}

export interface BridgeTransaction {
  quoteId: string;
  fromChainId: number;
  toChainId: number;
  fromAddress: string;
  toAddress: string;
  tokenAddress: string;
  amount: string;
  transactionHash?: string;
  status: BridgeStatus;
  createdAt: number;
  updatedAt: number;
}

export enum BridgeStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled'
}

export interface BridgeEvent {
  transactionId: string;
  status: BridgeStatus;
  timestamp: number;
  message?: string;
  transactionHash?: string;
}

/**
 * Wanchain XFlows Bridge Manager
 * Handles cross-chain carbon credit transfers
 */
export class WanchainBridgeManager {
  private config: BridgeConfig;
  private connex: Connex;
  private eventListeners: Map<string, (event: BridgeEvent) => void> = new Map();

  constructor(config: BridgeConfig, connex: Connex) {
    this.config = config;
    this.connex = connex;
  }

  /**
   * Discover supported tokens for bridging
   * @param chainId Optional chain ID to filter tokens
   * @returns Array of supported tokens
   */
  async discoverSupportedTokens(chainId?: number): Promise<SupportedToken[]> {
    try {
      const url = chainId 
        ? `${this.config.apiUrl}/tokens?chainId=${chainId}`
        : `${this.config.apiUrl}/tokens`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch supported tokens: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error discovering supported tokens:', error);
      throw error;
    }
  }

  /**
   * Get a quote for bridging tokens
   * @param fromChainId Source chain ID
   * @param toChainId Destination chain ID
   * @param tokenAddress Token contract address
   * @param amount Amount to bridge
   * @param slippage Slippage tolerance (default: 0.5%)
   * @returns Bridge quote
   */
  async getBridgeQuote(
    fromChainId: number,
    toChainId: number,
    tokenAddress: string,
    amount: string,
    slippage: number = 0.5
  ): Promise<BridgeQuote> {
    try {
      const response = await fetch(`${this.config.apiUrl}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          fromChainId,
          toChainId,
          tokenAddress,
          amount,
          slippage
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get bridge quote: ${response.statusText}`);
      }

      const data = await response.json();
      return data.quote;
    } catch (error) {
      console.error('Error getting bridge quote:', error);
      throw error;
    }
  }

  /**
   * Build bridge transaction
   * @param quote Bridge quote
   * @param fromAddress Source address
   * @param toAddress Destination address
   * @returns Bridge transaction data
   */
  async buildBridgeTransaction(
    quote: BridgeQuote,
    fromAddress: string,
    toAddress: string
  ): Promise<BridgeTransaction> {
    try {
      const response = await fetch(`${this.config.apiUrl}/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          quoteId: quote.quoteId,
          fromAddress,
          toAddress
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to build bridge transaction: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transaction;
    } catch (error) {
      console.error('Error building bridge transaction:', error);
      throw error;
    }
  }

  /**
   * Execute bridge transaction
   * @param transaction Bridge transaction data
   * @param wallet User's wallet for signing
   * @returns Transaction hash
   */
  async executeBridgeTransaction(
    transaction: BridgeTransaction,
    wallet: ethers.Wallet
  ): Promise<string> {
    try {
      // For VeChain, we need to use Connex for transaction execution
      const method = this.connex.thor.account(this.config.contractAddress).method({
        constant: false,
        inputs: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'destinationChainId', type: 'uint256' },
          { name: 'bridgeTransactionId', type: 'uint256' }
        ],
        name: 'lockTokenForBridge',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      });

      // Extract token ID from transaction data (assuming it's in the transaction data)
      const tokenId = this.extractTokenIdFromTransaction(transaction);
      
      const clause = method.asClause(
        tokenId,
        transaction.toAddress,
        transaction.toChainId,
        parseInt(transaction.quoteId)
      );

      const tx = {
        clauses: [clause],
        gas: 500000,
        gasPrice: '0x0'
      };

      const signedTx = await wallet.signTransaction(tx);
      const result = await this.connex.thor.transaction(signedTx).send();
      
      return result.txid;
    } catch (error) {
      console.error('Error executing bridge transaction:', error);
      throw error;
    }
  }

  /**
   * Track bridge transaction status
   * @param transactionId Transaction ID to track
   * @returns Current transaction status
   */
  async trackBridgeStatus(transactionId: string): Promise<BridgeTransaction> {
    try {
      const response = await fetch(`${this.config.apiUrl}/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to track bridge status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transaction;
    } catch (error) {
      console.error('Error tracking bridge status:', error);
      throw error;
    }
  }

  /**
   * Subscribe to bridge events
   * @param transactionId Transaction ID to monitor
   * @param callback Event callback function
   */
  subscribeToBridgeEvents(
    transactionId: string,
    callback: (event: BridgeEvent) => void
  ): void {
    this.eventListeners.set(transactionId, callback);
    
    // Start polling for status updates
    this.startStatusPolling(transactionId);
  }

  /**
   * Unsubscribe from bridge events
   * @param transactionId Transaction ID to stop monitoring
   */
  unsubscribeFromBridgeEvents(transactionId: string): void {
    this.eventListeners.delete(transactionId);
  }

  /**
   * Get bridge history for an address
   * @param address User address
   * @param limit Number of transactions to fetch
   * @returns Array of bridge transactions
   */
  async getBridgeHistory(address: string, limit: number = 50): Promise<BridgeTransaction[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/history/${address}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bridge history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching bridge history:', error);
      throw error;
    }
  }

  /**
   * Get supported chains
   * @returns Array of supported chain information
   */
  async getSupportedChains(): Promise<Array<{ chainId: number; name: string; rpcUrl: string }>> {
    try {
      const response = await fetch(`${this.config.apiUrl}/chains`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch supported chains: ${response.statusText}`);
      }

      const data = await response.json();
      return data.chains || [];
    } catch (error) {
      console.error('Error fetching supported chains:', error);
      throw error;
    }
  }

  // Private methods
  private extractTokenIdFromTransaction(transaction: BridgeTransaction): number {
    // This is a simplified implementation
    // In a real scenario, you'd need to extract the token ID from the transaction data
    // For now, we'll use a hash of the transaction ID
    return parseInt(transaction.quoteId) % 1000000;
  }

  private async startStatusPolling(transactionId: string): Promise<void> {
    const pollInterval = 30000; // 30 seconds
    const maxPollingTime = 30 * 60 * 1000; // 30 minutes
    const startTime = Date.now();

    const poll = async () => {
      try {
        const transaction = await this.trackBridgeStatus(transactionId);
        const callback = this.eventListeners.get(transactionId);

        if (callback) {
          const event: BridgeEvent = {
            transactionId,
            status: transaction.status as BridgeStatus,
            timestamp: Date.now(),
            transactionHash: transaction.transactionHash
          };

          callback(event);

          // Stop polling if transaction is completed, failed, or cancelled
          if (['completed', 'failed', 'cancelled'].includes(transaction.status)) {
            this.eventListeners.delete(transactionId);
            return;
          }
        }

        // Continue polling if not expired
        if (Date.now() - startTime < maxPollingTime) {
          setTimeout(poll, pollInterval);
        } else {
          // Timeout - stop polling
          this.eventListeners.delete(transactionId);
        }
      } catch (error) {
        console.error('Error polling bridge status:', error);
        // Continue polling on error
        if (Date.now() - startTime < maxPollingTime) {
          setTimeout(poll, pollInterval);
        }
      }
    };

    // Start polling
    setTimeout(poll, pollInterval);
  }
}

/**
 * Carbon Credit Bridge Integration
 * Specialized bridge manager for carbon credit NFTs
 */
export class CarbonCreditBridgeManager extends WanchainBridgeManager {
  private nftContract: ethers.Contract;

  constructor(
    config: BridgeConfig,
    connex: Connex,
    nftContractAddress: string,
    nftABI: any[]
  ) {
    super(config, connex);
    this.nftContract = new ethers.Contract(nftContractAddress, nftABI);
  }

  /**
   * Bridge a carbon credit NFT to another chain
   * @param tokenId Carbon credit NFT token ID
   * @param toChainId Destination chain ID
   * @param toAddress Recipient address on destination chain
   * @param wallet User's wallet for signing
   * @returns Bridge transaction ID
   */
  async bridgeCarbonCredit(
    tokenId: number,
    toChainId: number,
    toAddress: string,
    wallet: ethers.Wallet
  ): Promise<string> {
    try {
      // Get quote for bridging
      const quote = await this.getBridgeQuote(
        this.config.chainId,
        toChainId,
        this.nftContract.target as string,
        '1', // NFT amount (always 1 for ERC-721)
        0.5 // 0.5% slippage
      );

      // Build bridge transaction
      const transaction = await this.buildBridgeTransaction(
        quote,
        wallet.address,
        toAddress
      );

      // Execute bridge transaction
      const txHash = await this.executeBridgeTransaction(transaction, wallet);

      // Update transaction with hash
      transaction.transactionHash = txHash;
      transaction.status = BridgeStatus.Processing;

      return transaction.quoteId;
    } catch (error) {
      console.error('Error bridging carbon credit:', error);
      throw error;
    }
  }

  /**
   * Get carbon credit bridge history
   * @param userAddress User's address
   * @returns Array of carbon credit bridge transactions
   */
  async getCarbonCreditBridgeHistory(userAddress: string): Promise<BridgeTransaction[]> {
    const history = await this.getBridgeHistory(userAddress);
    
    // Filter for carbon credit transactions
    return history.filter(tx => 
      tx.tokenAddress.toLowerCase() === this.nftContract.target.toString().toLowerCase()
    );
  }

  /**
   * Check if a carbon credit is currently being bridged
   * @param tokenId Carbon credit token ID
   * @returns Bridge status information
   */
  async getCarbonCreditBridgeStatus(tokenId: number): Promise<{
    isBridging: boolean;
    bridgeInfo?: any;
    transactionId?: string;
  }> {
    try {
      // Check on-chain bridge status
      const bridgeInfo = await this.nftContract.getBridgeInfo(tokenId);
      
      return {
        isBridging: bridgeInfo.bridgeStatus !== 0, // 0 = None
        bridgeInfo: bridgeInfo,
        transactionId: bridgeInfo.bridgeTransactionId.toString()
      };
    } catch (error) {
      console.error('Error checking carbon credit bridge status:', error);
      return { isBridging: false };
    }
  }
}

/**
 * Utility functions for Wanchain bridge integration
 */
export const WanchainBridgeUtils = {
  /**
   * Create a bridge manager instance
   * @param config Bridge configuration
   * @param connex Connex instance
   * @returns WanchainBridgeManager instance
   */
  createBridgeManager: (config: BridgeConfig, connex: Connex): WanchainBridgeManager => {
    return new WanchainBridgeManager(config, connex);
  },

  /**
   * Create a carbon credit bridge manager instance
   * @param config Bridge configuration
   * @param connex Connex instance
   * @param nftContractAddress NFT contract address
   * @param nftABI NFT contract ABI
   * @returns CarbonCreditBridgeManager instance
   */
  createCarbonCreditBridgeManager: (
    config: BridgeConfig,
    connex: Connex,
    nftContractAddress: string,
    nftABI: any[]
  ): CarbonCreditBridgeManager => {
    return new CarbonCreditBridgeManager(config, connex, nftContractAddress, nftABI);
  },

  /**
   * Get default bridge configuration for VeChain
   * @param network Network name (testnet/mainnet)
   * @returns Bridge configuration
   */
  getDefaultConfig: (network: 'testnet' | 'mainnet' = 'mainnet'): BridgeConfig => {
    const configs = {
      testnet: {
        apiUrl: 'https://bridge-testnet.wanchain.org/api',
        chainId: 100010, // VeChain testnet
        contractAddress: '', // Will be set after deployment
        apiKey: undefined
      },
      mainnet: {
        apiUrl: 'https://bridge.wanchain.org/api',
        chainId: 100009, // VeChain mainnet
        contractAddress: '', // Will be set after deployment
        apiKey: undefined
      }
    };

    return configs[network];
  },

  /**
   * Format bridge status for display
   * @param status Bridge status
   * @returns Formatted status string
   */
  formatBridgeStatus: (status: BridgeStatus): string => {
    const statusMap = {
      [BridgeStatus.Pending]: 'Pending',
      [BridgeStatus.Processing]: 'Processing',
      [BridgeStatus.Completed]: 'Completed',
      [BridgeStatus.Failed]: 'Failed',
      [BridgeStatus.Cancelled]: 'Cancelled'
    };

    return statusMap[status] || 'Unknown';
  },

  /**
   * Calculate estimated bridge time
   * @param fromChainId Source chain ID
   * @param toChainId Destination chain ID
   * @returns Estimated time in minutes
   */
  calculateEstimatedTime: (fromChainId: number, toChainId: number): number => {
    // Simplified estimation based on chain types
    const isVeChain = fromChainId === 100009 || fromChainId === 100010;
    const isEthereum = toChainId === 1 || toChainId === 11155111;
    const isPolygon = toChainId === 137 || toChainId === 80001;
    const isBSC = toChainId === 56 || toChainId === 97;

    if (isVeChain && isEthereum) return 15; // VeChain to Ethereum: ~15 minutes
    if (isVeChain && isPolygon) return 10; // VeChain to Polygon: ~10 minutes
    if (isVeChain && isBSC) return 8; // VeChain to BSC: ~8 minutes

    return 12; // Default: ~12 minutes
  }
};

export default WanchainBridgeManager;
