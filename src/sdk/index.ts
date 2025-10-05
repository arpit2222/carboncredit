/**
 * VeChain Carbon Credit SDK
 * Main entry point for the JavaScript SDK
 */

// Core SDK
export { VeChainCarbonCreditSDK } from './VeChainSDK';
export type { 
  SDKConfig, 
  ContractAddresses, 
  CarbonCreditMetadata, 
  OrganizationProfile, 
  FarmerProfile, 
  VerificationRequest, 
  UserRewardInfo 
} from './VeChainSDK';

// Contract Modules
export { CarbonCreditNFTModule } from './contracts/CarbonCreditNFTModule';
export type { 
  MintCarbonCreditParams, 
  BurnCarbonCreditParams, 
  RetireCarbonCreditParams, 
  UpdateVerificationStatusParams, 
  BridgeTokenParams 
} from './contracts/CarbonCreditNFTModule';

export { OrganizationRegistryModule } from './contracts/OrganizationRegistryModule';
export type { 
  RegisterOrganizationParams, 
  UpdateOrganizationParams, 
  VerifyOrganizationParams, 
  SetOrganizationStatusParams 
} from './contracts/OrganizationRegistryModule';

export { FarmerRegistryModule } from './contracts/FarmerRegistryModule';
export type { 
  RegisterFarmerParams, 
  UpdateFarmerParams, 
  UpdateOrganizationAssociationParams, 
  VerifyFarmerParams, 
  SetFarmerStatusParams 
} from './contracts/FarmerRegistryModule';

export { CarbonCreditVerifierModule } from './contracts/CarbonCreditVerifierModule';
export type { 
  SubmitVerificationRequestParams, 
  AssignVerifierParams, 
  UpdateVerificationStageParams, 
  ApproveVerificationRequestParams, 
  RejectVerificationRequestParams 
} from './contracts/CarbonCreditVerifierModule';

export { VeBetterIntegrationModule } from './contracts/VeBetterIntegrationModule';
export type { 
  ClaimRewardsParams, 
  BatchClaimRewardsParams, 
  UpdateRewardConfigParams, 
  SetUserActiveParams, 
  DepositB3TRParams 
} from './contracts/VeBetterIntegrationModule';

// Helper Functions
export { CarbonCreditHelpers } from './helpers/CarbonCreditHelpers';
export type { 
  MintCarbonCreditHelperParams, 
  RegisterOrganizationHelperParams, 
  RegisterFarmerHelperParams, 
  SubmitVerificationRequestHelperParams, 
  ClaimRewardsHelperParams 
} from './helpers/CarbonCreditHelpers';

// IPFS Utilities
export { IPFSUtils } from './helpers/IPFSUtils';
export type { IPFSConfig, IPFSUploadResult } from './helpers/IPFSUtils';

// Wallet Integration
export { VeWorldWallet } from './wallet/VeWorldWallet';
export type { 
  VeWorldWalletConfig, 
  WalletConnectionResult, 
  TransactionResult 
} from './wallet/VeWorldWallet';

// Utility Functions
export * from '../utils';

// Default export
export { VeChainCarbonCreditSDK as default } from './VeChainSDK';
