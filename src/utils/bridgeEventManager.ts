import { ethers } from 'ethers';
import { Connex } from '@vechain/connex';
import { BridgeEvent, BridgeStatus, WanchainBridgeManager } from './wanchainBridge';

/**
 * Bridge Event Manager
 * Handles cross-chain bridge events and metadata synchronization
 */

export interface BridgeEventFilter {
  transactionId?: string;
  status?: BridgeStatus;
  fromChainId?: number;
  toChainId?: number;
  userAddress?: string;
  startTime?: number;
  endTime?: number;
}

export interface BridgeEventSubscription {
  id: string;
  filter: BridgeEventFilter;
  callback: (event: BridgeEvent) => void;
  isActive: boolean;
}

export interface CrossChainMetadata {
  tokenId: number;
  sourceChainId: number;
  destinationChainId: number;
  sourceContractAddress: string;
  destinationContractAddress: string;
  bridgeTransactionId: string;
  metadataHash: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  lastSyncTime: number;
}

/**
 * Bridge Event Manager
 * Manages bridge events and cross-chain metadata synchronization
 */
export class BridgeEventManager {
  private subscriptions: Map<string, BridgeEventSubscription> = new Map();
  private eventHistory: BridgeEvent[] = [];
  private metadataCache: Map<number, CrossChainMetadata> = new Map();
  private connex: Connex;
  private bridgeManager: WanchainBridgeManager;

  constructor(connex: Connex, bridgeManager: WanchainBridgeManager) {
    this.connex = connex;
    this.bridgeManager = bridgeManager;
  }

  /**
   * Subscribe to bridge events with filter
   * @param filter Event filter criteria
   * @param callback Event callback function
   * @returns Subscription ID
   */
  subscribeToBridgeEvents(
    filter: BridgeEventFilter,
    callback: (event: BridgeEvent) => void
  ): string {
    const subscriptionId = this.generateSubscriptionId();
    
    const subscription: BridgeEventSubscription = {
      id: subscriptionId,
      filter,
      callback,
      isActive: true
    };

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  /**
   * Unsubscribe from bridge events
   * @param subscriptionId Subscription ID to cancel
   */
  unsubscribeFromBridgeEvents(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Process incoming bridge event
   * @param event Bridge event to process
   */
  async processBridgeEvent(event: BridgeEvent): Promise<void> {
    // Add to event history
    this.eventHistory.push(event);

    // Notify matching subscriptions
    for (const subscription of this.subscriptions.values()) {
      if (subscription.isActive && this.matchesFilter(event, subscription.filter)) {
        try {
          subscription.callback(event);
        } catch (error) {
          console.error('Error in bridge event callback:', error);
        }
      }
    }

    // Handle status-specific logic
    await this.handleEventStatus(event);
  }

  /**
   * Get bridge event history
   * @param filter Optional filter criteria
   * @param limit Maximum number of events to return
   * @returns Array of bridge events
   */
  getBridgeEventHistory(filter?: BridgeEventFilter, limit: number = 100): BridgeEvent[] {
    let events = this.eventHistory;

    if (filter) {
      events = events.filter(event => this.matchesFilter(event, filter));
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp - a.timestamp);

    return events.slice(0, limit);
  }

  /**
   * Sync cross-chain metadata
   * @param tokenId Token ID to sync
   * @param sourceChainId Source chain ID
   * @param destinationChainId Destination chain ID
   * @param bridgeTransactionId Bridge transaction ID
   */
  async syncCrossChainMetadata(
    tokenId: number,
    sourceChainId: number,
    destinationChainId: number,
    bridgeTransactionId: string
  ): Promise<void> {
    try {
      // Get metadata from source chain
      const sourceMetadata = await this.getTokenMetadata(tokenId, sourceChainId);
      
      if (!sourceMetadata) {
        throw new Error('Failed to get source metadata');
      }

      // Create cross-chain metadata record
      const crossChainMetadata: CrossChainMetadata = {
        tokenId,
        sourceChainId,
        destinationChainId,
        sourceContractAddress: sourceMetadata.contractAddress,
        destinationContractAddress: '', // Will be set when syncing to destination
        bridgeTransactionId,
        metadataHash: this.calculateMetadataHash(sourceMetadata),
        syncStatus: 'pending',
        lastSyncTime: Date.now()
      };

      // Cache the metadata
      this.metadataCache.set(tokenId, crossChainMetadata);

      // Emit sync event
      await this.processBridgeEvent({
        transactionId: bridgeTransactionId,
        status: BridgeStatus.Processing,
        timestamp: Date.now(),
        message: `Syncing metadata for token ${tokenId} from chain ${sourceChainId} to ${destinationChainId}`
      });

      // Update sync status
      crossChainMetadata.syncStatus = 'synced';
      crossChainMetadata.lastSyncTime = Date.now();

    } catch (error) {
      console.error('Error syncing cross-chain metadata:', error);
      
      // Update sync status to failed
      const metadata = this.metadataCache.get(tokenId);
      if (metadata) {
        metadata.syncStatus = 'failed';
        metadata.lastSyncTime = Date.now();
      }

      // Emit error event
      await this.processBridgeEvent({
        transactionId: bridgeTransactionId,
        status: BridgeStatus.Failed,
        timestamp: Date.now(),
        message: `Failed to sync metadata for token ${tokenId}: ${error}`
      });
    }
  }

  /**
   * Get cross-chain metadata for a token
   * @param tokenId Token ID
   * @returns Cross-chain metadata or null if not found
   */
  getCrossChainMetadata(tokenId: number): CrossChainMetadata | null {
    return this.metadataCache.get(tokenId) || null;
  }

  /**
   * Get all cross-chain metadata
   * @returns Array of all cross-chain metadata
   */
  getAllCrossChainMetadata(): CrossChainMetadata[] {
    return Array.from(this.metadataCache.values());
  }

  /**
   * Clear old events from history
   * @param maxAge Maximum age of events to keep (in milliseconds)
   */
  clearOldEvents(maxAge: number = 7 * 24 * 60 * 60 * 1000): void { // 7 days default
    const cutoffTime = Date.now() - maxAge;
    this.eventHistory = this.eventHistory.filter(event => event.timestamp > cutoffTime);
  }

  /**
   * Get bridge statistics
   * @returns Bridge statistics
   */
  getBridgeStatistics(): {
    totalEvents: number;
    activeSubscriptions: number;
    syncedMetadata: number;
    failedMetadata: number;
    pendingMetadata: number;
  } {
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.isActive).length;

    const syncedMetadata = Array.from(this.metadataCache.values())
      .filter(meta => meta.syncStatus === 'synced').length;

    const failedMetadata = Array.from(this.metadataCache.values())
      .filter(meta => meta.syncStatus === 'failed').length;

    const pendingMetadata = Array.from(this.metadataCache.values())
      .filter(meta => meta.syncStatus === 'pending').length;

    return {
      totalEvents: this.eventHistory.length,
      activeSubscriptions,
      syncedMetadata,
      failedMetadata,
      pendingMetadata
    };
  }

  // Private methods
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private matchesFilter(event: BridgeEvent, filter: BridgeEventFilter): boolean {
    if (filter.transactionId && event.transactionId !== filter.transactionId) {
      return false;
    }

    if (filter.status && event.status !== filter.status) {
      return false;
    }

    if (filter.startTime && event.timestamp < filter.startTime) {
      return false;
    }

    if (filter.endTime && event.timestamp > filter.endTime) {
      return false;
    }

    return true;
  }

  private async handleEventStatus(event: BridgeEvent): Promise<void> {
    switch (event.status) {
      case BridgeStatus.Processing:
        // Bridge transaction is being processed
        await this.handleProcessingEvent(event);
        break;
      case BridgeStatus.Completed:
        // Bridge transaction completed successfully
        await this.handleCompletedEvent(event);
        break;
      case BridgeStatus.Failed:
        // Bridge transaction failed
        await this.handleFailedEvent(event);
        break;
      case BridgeStatus.Cancelled:
        // Bridge transaction was cancelled
        await this.handleCancelledEvent(event);
        break;
    }
  }

  private async handleProcessingEvent(event: BridgeEvent): Promise<void> {
    // Extract token ID from transaction ID (simplified)
    const tokenId = this.extractTokenIdFromTransactionId(event.transactionId);
    
    if (tokenId) {
      // Start metadata sync process
      await this.syncCrossChainMetadata(
        tokenId,
        100009, // VeChain mainnet (simplified)
        1, // Ethereum mainnet (simplified)
        event.transactionId
      );
    }
  }

  private async handleCompletedEvent(event: BridgeEvent): Promise<void> {
    // Bridge completed successfully
    const tokenId = this.extractTokenIdFromTransactionId(event.transactionId);
    
    if (tokenId) {
      const metadata = this.metadataCache.get(tokenId);
      if (metadata) {
        metadata.syncStatus = 'synced';
        metadata.lastSyncTime = Date.now();
      }
    }
  }

  private async handleFailedEvent(event: BridgeEvent): Promise<void> {
    // Bridge failed
    const tokenId = this.extractTokenIdFromTransactionId(event.transactionId);
    
    if (tokenId) {
      const metadata = this.metadataCache.get(tokenId);
      if (metadata) {
        metadata.syncStatus = 'failed';
        metadata.lastSyncTime = Date.now();
      }
    }
  }

  private async handleCancelledEvent(event: BridgeEvent): Promise<void> {
    // Bridge was cancelled
    const tokenId = this.extractTokenIdFromTransactionId(event.transactionId);
    
    if (tokenId) {
      const metadata = this.metadataCache.get(tokenId);
      if (metadata) {
        metadata.syncStatus = 'failed';
        metadata.lastSyncTime = Date.now();
      }
    }
  }

  private async getTokenMetadata(tokenId: number, chainId: number): Promise<any> {
    // Simplified implementation - in reality, you'd query the specific chain
    return {
      tokenId,
      contractAddress: '0x...', // Contract address on the chain
      metadata: {
        name: `Carbon Credit #${tokenId}`,
        description: 'Cross-chain carbon credit',
        image: 'ipfs://...',
        attributes: []
      }
    };
  }

  private calculateMetadataHash(metadata: any): string {
    // Calculate hash of metadata for verification
    const metadataString = JSON.stringify(metadata);
    return ethers.keccak256(ethers.toUtf8Bytes(metadataString));
  }

  private extractTokenIdFromTransactionId(transactionId: string): number | null {
    // Simplified implementation - extract token ID from transaction ID
    try {
      return parseInt(transactionId.split('_')[1]) || null;
    } catch {
      return null;
    }
  }
}

/**
 * Bridge Event Listener
 * Listens for on-chain bridge events and processes them
 */
export class BridgeEventListener {
  private eventManager: BridgeEventManager;
  private connex: Connex;
  private contractAddress: string;
  private isListening: boolean = false;

  constructor(
    eventManager: BridgeEventManager,
    connex: Connex,
    contractAddress: string
  ) {
    this.eventManager = eventManager;
    this.connex = connex;
    this.contractAddress = contractAddress;
  }

  /**
   * Start listening for bridge events
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    this.listenForTokenLockedEvents();
    this.listenForTokenUnlockedEvents();
    this.listenForBridgeStatusUpdatedEvents();
  }

  /**
   * Stop listening for bridge events
   */
  stopListening(): void {
    this.isListening = false;
  }

  private listenForTokenLockedEvents(): void {
    // Listen for TokenLocked events
    const filter = {
      address: this.contractAddress,
      topics: [
        ethers.id('TokenLocked(uint256,address,address,uint256,uint256)')
      ]
    };

    // In a real implementation, you'd set up event listeners
    // This is a simplified version
    console.log('Listening for TokenLocked events...');
  }

  private listenForTokenUnlockedEvents(): void {
    // Listen for TokenUnlocked events
    const filter = {
      address: this.contractAddress,
      topics: [
        ethers.id('TokenUnlocked(uint256,address,uint256,uint256)')
      ]
    };

    console.log('Listening for TokenUnlocked events...');
  }

  private listenForBridgeStatusUpdatedEvents(): void {
    // Listen for BridgeStatusUpdated events
    const filter = {
      address: this.contractAddress,
      topics: [
        ethers.id('BridgeStatusUpdated(uint256,uint8,uint8,uint256)')
      ]
    };

    console.log('Listening for BridgeStatusUpdated events...');
  }
}

/**
 * Utility functions for bridge event management
 */
export const BridgeEventUtils = {
  /**
   * Create a bridge event manager
   * @param connex Connex instance
   * @param bridgeManager Bridge manager instance
   * @returns BridgeEventManager instance
   */
  createEventManager: (connex: Connex, bridgeManager: WanchainBridgeManager): BridgeEventManager => {
    return new BridgeEventManager(connex, bridgeManager);
  },

  /**
   * Create a bridge event listener
   * @param eventManager Event manager instance
   * @param connex Connex instance
   * @param contractAddress Contract address
   * @returns BridgeEventListener instance
   */
  createEventListener: (
    eventManager: BridgeEventManager,
    connex: Connex,
    contractAddress: string
  ): BridgeEventListener => {
    return new BridgeEventListener(eventManager, connex, contractAddress);
  },

  /**
   * Format bridge event for display
   * @param event Bridge event
   * @returns Formatted event string
   */
  formatBridgeEvent: (event: BridgeEvent): string => {
    const timestamp = new Date(event.timestamp).toLocaleString();
    const status = event.status.charAt(0).toUpperCase() + event.status.slice(1);
    
    return `[${timestamp}] ${status}: ${event.transactionId}${event.message ? ` - ${event.message}` : ''}`;
  },

  /**
   * Check if bridge event is recent
   * @param event Bridge event
   * @param maxAge Maximum age in milliseconds
   * @returns Whether event is recent
   */
  isRecentEvent: (event: BridgeEvent, maxAge: number = 24 * 60 * 60 * 1000): boolean => {
    return Date.now() - event.timestamp < maxAge;
  }
};

export default BridgeEventManager;
