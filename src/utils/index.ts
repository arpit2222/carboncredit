/**
 * VeChain Carbon Credit System - Utility Functions
 * Exports all utility functions for easy importing
 */

// Fee delegation utilities
export * from './feeDelegation';
export { default as VeChainFeeDelegation } from './feeDelegation';

// VeChain helper utilities
export * from './vechainHelpers';
export { default as VeChainNetworkManager } from './vechainHelpers';

// Wanchain bridge utilities
export * from './wanchainBridge';
export { default as WanchainBridgeManager } from './wanchainBridge';

// Bridge event management
export * from './bridgeEventManager';
export { default as BridgeEventManager } from './bridgeEventManager';

// Re-export commonly used types
export type {
  DelegationConfig,
  DelegationRequest,
  DelegationResponse,
  VeChainConfig
} from './feeDelegation';

export type {
  VeChainConfig as VeChainNetworkConfig
} from './vechainHelpers';

export type {
  BridgeConfig,
  SupportedToken,
  BridgeQuote,
  BridgeTransaction,
  BridgeEvent,
  BridgeStatus
} from './wanchainBridge';

export type {
  BridgeEventFilter,
  BridgeEventSubscription,
  CrossChainMetadata
} from './bridgeEventManager';
