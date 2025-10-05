import { Connex } from '@vechain/connex';
import { ethers } from 'ethers';
import { 
  VeChainNetworkManager, 
  VeChainUtils,
  WanchainBridgeManager,
  BridgeEventManager,
  VeChainFeeDelegation
} from '../utils';

/**
 * VeChain Carbon Credit SDK
 * Main SDK class for interacting with the carbon credit system
 */

export interface SDKConfig {
  network: 'testnet' | 'mainnet' | 'solo';
  connex: Connex;
  wallet?: ethers.Wallet;
  feeDelegation?: boolean;
  bridgeEnabled?: boolean;
  ipfsProvider?: 'pinata' | 'web3storage';
  ipfsConfig?: {
    pinataApiKey?: string;
    pinataSecretKey?: string;
    web3StorageToken?: string;
  };
}

export interface ContractAddresses {
  carbonCreditNFT: string;
  organizationRegistry: string;
  farmerRegistry: string;
  carbonCreditVerifier: string;
  feeDelegationManager: string;
  veBetterIntegration: string;
}

export interface CarbonCreditMetadata {
  creditId: number;
  carbonAmount: string;
  generatorAddress: string;
  location: string;
  verificationStatus: number;
  generationDate: number;
  expiryDate: number;
  projectType: number;
  proofsIPFSHash: string;
  bridgeStatus: number;
  bridgeTransactionId: number;
  bridgeTimestamp: number;
}

export interface OrganizationProfile {
  orgId: number;
  name: string;
  walletAddress: string;
  verificationStatus: number;
  totalCreditsGenerated: string;
  kycDocumentsHash: string;
  registrationDate: number;
  lastUpdated: number;
}

export interface FarmerProfile {
  farmerId: number;
  name: string;
  location: string;
  walletAddress: string;
  landSize: string;
  associatedOrg: number;
  verificationDocumentsHash: string;
  registrationDate: number;
  lastUpdated: number;
}

export interface VerificationRequest {
  requestId: number;
  farmerId: number;
  orgId: number;
  submitter: string;
  carbonAmount: string;
  location: string;
  projectType: number;
  projectDescription: string;
  technicalDocumentsHash: string;
  fieldEvidenceHash: string;
  monitoringPlanHash: string;
  currentStage: number;
  assignedVerifier: string;
  reviewDeadline: number;
  submissionDate: number;
  lastUpdated: number;
}

export interface UserRewardInfo {
  totalEarned: string;
  totalClaimed: string;
  pendingRewards: string;
  lastClaimTime: number;
  totalCarbonCredits: string;
  rewardEligibleCredits: string;
  isActive: boolean;
}

/**
 * VeChain Carbon Credit SDK
 * Main SDK class for interacting with the carbon credit system
 */
export class VeChainCarbonCreditSDK {
  private config: SDKConfig;
  private networkManager: VeChainNetworkManager;
  private contractAddresses: ContractAddresses;
  private feeDelegation?: VeChainFeeDelegation;
  private bridgeManager?: WanchainBridgeManager;
  private eventManager?: BridgeEventManager;

  constructor(config: SDKConfig, contractAddresses: ContractAddresses) {
    this.config = config;
    this.contractAddresses = contractAddresses;
    this.networkManager = new VeChainNetworkManager(
      VeChainUtils.createTestnetManager(config.connex).getConfig(),
      config.connex
    );

    // Initialize fee delegation if enabled
    if (config.feeDelegation) {
      this.feeDelegation = new VeChainFeeDelegation(config.connex);
    }

    // Initialize bridge if enabled
    if (config.bridgeEnabled) {
      this.bridgeManager = new WanchainBridgeManager(
        {
          apiUrl: config.network === 'mainnet' 
            ? 'https://bridge.wanchain.org/api'
            : 'https://bridge-testnet.wanchain.org/api',
          chainId: config.network === 'mainnet' ? 100009 : 100010,
          contractAddress: contractAddresses.carbonCreditNFT
        },
        config.connex
      );

      this.eventManager = new BridgeEventManager(config.connex, this.bridgeManager);
    }
  }

  /**
   * Get network configuration
   */
  getNetworkConfig() {
    return this.networkManager.getConfig();
  }

  /**
   * Get contract addresses
   */
  getContractAddresses(): ContractAddresses {
    return this.contractAddresses;
  }

  /**
   * Check if fee delegation is enabled
   */
  isFeeDelegationEnabled(): boolean {
    return this.config.feeDelegation || false;
  }

  /**
   * Check if bridge is enabled
   */
  isBridgeEnabled(): boolean {
    return this.config.bridgeEnabled || false;
  }

  /**
   * Get fee delegation manager
   */
  getFeeDelegationManager(): VeChainFeeDelegation | undefined {
    return this.feeDelegation;
  }

  /**
   * Get bridge manager
   */
  getBridgeManager(): WanchainBridgeManager | undefined {
    return this.bridgeManager;
  }

  /**
   * Get event manager
   */
  getEventManager(): BridgeEventManager | undefined {
    return this.eventManager;
  }

  /**
   * Get wallet balance in VET
   */
  async getVETBalance(address: string): Promise<string> {
    if (!this.config.wallet) {
      throw new Error('Wallet not configured');
    }
    return VeChainUtils.formatVET(await this.config.wallet.provider.getBalance(address));
  }

  /**
   * Get wallet balance in VTHO
   */
  async getVTHOBalance(address: string): Promise<string> {
    if (!this.config.wallet) {
      throw new Error('Wallet not configured');
    }
    return VeChainUtils.formatVTHO(await this.config.wallet.provider.getBalance(address));
  }

  /**
   * Get carbon credit NFT metadata
   */
  async getCarbonCreditMetadata(tokenId: number): Promise<CarbonCreditMetadata> {
    const method = this.config.connex.thor.account(this.contractAddresses.carbonCreditNFT).method({
      constant: true,
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'getCreditMetadata',
      outputs: [
        { name: 'creditId', type: 'uint256' },
        { name: 'carbonAmount', type: 'uint256' },
        { name: 'generatorAddress', type: 'address' },
        { name: 'location', type: 'string' },
        { name: 'verificationStatus', type: 'uint8' },
        { name: 'generationDate', type: 'uint256' },
        { name: 'expiryDate', type: 'uint256' },
        { name: 'projectType', type: 'uint8' },
        { name: 'proofsIPFSHash', type: 'string' },
        { name: 'bridgeStatus', type: 'uint8' },
        { name: 'bridgeTransactionId', type: 'uint256' },
        { name: 'bridgeTimestamp', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(tokenId);
    
    return {
      creditId: result[0],
      carbonAmount: result[1].toString(),
      generatorAddress: result[2],
      location: result[3],
      verificationStatus: result[4],
      generationDate: result[5],
      expiryDate: result[6],
      projectType: result[7],
      proofsIPFSHash: result[8],
      bridgeStatus: result[9],
      bridgeTransactionId: result[10],
      bridgeTimestamp: result[11]
    };
  }

  /**
   * Get organization profile
   */
  async getOrganizationProfile(orgId: number): Promise<OrganizationProfile> {
    const method = this.config.connex.thor.account(this.contractAddresses.organizationRegistry).method({
      constant: true,
      inputs: [{ name: 'orgId', type: 'uint256' }],
      name: 'getOrganizationProfile',
      outputs: [
        { name: 'orgId', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'walletAddress', type: 'address' },
        { name: 'verificationStatus', type: 'uint8' },
        { name: 'totalCreditsGenerated', type: 'uint256' },
        { name: 'kycDocumentsHash', type: 'string' },
        { name: 'registrationDate', type: 'uint256' },
        { name: 'lastUpdated', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(orgId);
    
    return {
      orgId: result[0],
      name: result[1],
      walletAddress: result[2],
      verificationStatus: result[3],
      totalCreditsGenerated: result[4].toString(),
      kycDocumentsHash: result[5],
      registrationDate: result[6],
      lastUpdated: result[7]
    };
  }

  /**
   * Get farmer profile
   */
  async getFarmerProfile(farmerId: number): Promise<FarmerProfile> {
    const method = this.config.connex.thor.account(this.contractAddresses.farmerRegistry).method({
      constant: true,
      inputs: [{ name: 'farmerId', type: 'uint256' }],
      name: 'getFarmerProfile',
      outputs: [
        { name: 'farmerId', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'walletAddress', type: 'address' },
        { name: 'landSize', type: 'uint256' },
        { name: 'associatedOrg', type: 'uint256' },
        { name: 'verificationDocumentsHash', type: 'string' },
        { name: 'registrationDate', type: 'uint256' },
        { name: 'lastUpdated', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(farmerId);
    
    return {
      farmerId: result[0],
      name: result[1],
      location: result[2],
      walletAddress: result[3],
      landSize: result[4].toString(),
      associatedOrg: result[5],
      verificationDocumentsHash: result[6],
      registrationDate: result[7],
      lastUpdated: result[8]
    };
  }

  /**
   * Get verification request details
   */
  async getVerificationRequest(requestId: number): Promise<VerificationRequest> {
    const method = this.config.connex.thor.account(this.contractAddresses.carbonCreditVerifier).method({
      constant: true,
      inputs: [{ name: 'requestId', type: 'uint256' }],
      name: 'getVerificationRequest',
      outputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'farmerId', type: 'uint256' },
        { name: 'orgId', type: 'uint256' },
        { name: 'submitter', type: 'address' },
        { name: 'carbonAmount', type: 'uint256' },
        { name: 'location', type: 'string' },
        { name: 'projectType', type: 'uint8' },
        { name: 'projectDescription', type: 'string' },
        { name: 'technicalDocumentsHash', type: 'string' },
        { name: 'fieldEvidenceHash', type: 'string' },
        { name: 'monitoringPlanHash', type: 'string' },
        { name: 'currentStage', type: 'uint8' },
        { name: 'assignedVerifier', type: 'address' },
        { name: 'reviewDeadline', type: 'uint256' },
        { name: 'submissionDate', type: 'uint256' },
        { name: 'lastUpdated', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(requestId);
    
    return {
      requestId: result[0],
      farmerId: result[1],
      orgId: result[2],
      submitter: result[3],
      carbonAmount: result[4].toString(),
      location: result[5],
      projectType: result[6],
      projectDescription: result[7],
      technicalDocumentsHash: result[8],
      fieldEvidenceHash: result[9],
      monitoringPlanHash: result[10],
      currentStage: result[11],
      assignedVerifier: result[12],
      reviewDeadline: result[13],
      submissionDate: result[14],
      lastUpdated: result[15]
    };
  }

  /**
   * Get user reward information
   */
  async getUserRewardInfo(userAddress: string): Promise<UserRewardInfo> {
    const method = this.config.connex.thor.account(this.contractAddresses.veBetterIntegration).method({
      constant: true,
      inputs: [{ name: 'user', type: 'address' }],
      name: 'getUserRewardInfo',
      outputs: [
        { name: 'totalEarned', type: 'uint256' },
        { name: 'totalClaimed', type: 'uint256' },
        { name: 'pendingRewards', type: 'uint256' },
        { name: 'lastClaimTime', type: 'uint256' },
        { name: 'totalCarbonCredits', type: 'uint256' },
        { name: 'rewardEligibleCredits', type: 'uint256' },
        { name: 'isActive', type: 'bool' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(userAddress);
    
    return {
      totalEarned: result[0].toString(),
      totalClaimed: result[1].toString(),
      pendingRewards: result[2].toString(),
      lastClaimTime: result[3],
      totalCarbonCredits: result[4].toString(),
      rewardEligibleCredits: result[5].toString(),
      isActive: result[6]
    };
  }

  /**
   * Get total supply of carbon credit NFTs
   */
  async getTotalSupply(): Promise<number> {
    const method = this.config.connex.thor.account(this.contractAddresses.carbonCreditNFT).method({
      constant: true,
      inputs: [],
      name: 'totalSupply',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return parseInt(result[0].toString());
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStatistics(): Promise<{ totalBridged: number; totalLocked: number }> {
    const method = this.config.connex.thor.account(this.contractAddresses.carbonCreditNFT).method({
      constant: true,
      inputs: [],
      name: 'getBridgeStatistics',
      outputs: [
        { name: 'totalBridged', type: 'uint256' },
        { name: 'totalLocked', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return {
      totalBridged: parseInt(result[0].toString()),
      totalLocked: parseInt(result[1].toString())
    };
  }

  /**
   * Check if a token is locked for bridging
   */
  async isTokenLocked(tokenId: number): Promise<boolean> {
    const method = this.config.connex.thor.account(this.contractAddresses.carbonCreditNFT).method({
      constant: true,
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'isTokenLocked',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(tokenId);
    return result[0];
  }

  /**
   * Get bridge information for a token
   */
  async getBridgeInfo(tokenId: number): Promise<{
    recipient: string;
    destinationChainId: number;
    bridgeStatus: number;
    bridgeTransactionId: number;
    bridgeTimestamp: number;
  }> {
    const method = this.config.connex.thor.account(this.contractAddresses.carbonCreditNFT).method({
      constant: true,
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'getBridgeInfo',
      outputs: [
        { name: 'recipient', type: 'address' },
        { name: 'destinationChainId', type: 'uint256' },
        { name: 'bridgeStatus', type: 'uint8' },
        { name: 'bridgeTransactionId', type: 'uint256' },
        { name: 'bridgeTimestamp', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(tokenId);
    
    return {
      recipient: result[0],
      destinationChainId: parseInt(result[1].toString()),
      bridgeStatus: result[2],
      bridgeTransactionId: parseInt(result[3].toString()),
      bridgeTimestamp: result[4]
    };
  }

  /**
   * Get B3TR token balance in the reward pool
   */
  async getB3TRBalance(): Promise<string> {
    const method = this.config.connex.thor.account(this.contractAddresses.veBetterIntegration).method({
      constant: true,
      inputs: [],
      name: 'getB3TRBalance',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return VeChainUtils.formatVET(result[0].toString());
  }

  /**
   * Calculate potential B3TR reward
   */
  async calculatePotentialReward(carbonAmount: string, isVerified: boolean): Promise<string> {
    const method = this.config.connex.thor.account(this.contractAddresses.veBetterIntegration).method({
      constant: true,
      inputs: [
        { name: 'carbonAmount', type: 'uint256' },
        { name: 'isVerified', type: 'bool' }
      ],
      name: 'calculatePotentialReward',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(carbonAmount, isVerified);
    return VeChainUtils.formatVET(result[0].toString());
  }

  /**
   * Get available gas for fee delegation
   */
  async getAvailableGasForDelegation(sponsorAddress: string): Promise<number> {
    if (!this.feeDelegation) {
      throw new Error('Fee delegation not enabled');
    }

    return this.feeDelegation.getAvailableGasLimit(sponsorAddress);
  }

  /**
   * Check if delegation is available for a user
   */
  async isDelegationAvailable(userAddress: string, gasLimit: number): Promise<boolean> {
    if (!this.feeDelegation) {
      throw new Error('Fee delegation not enabled');
    }

    return this.feeDelegation.isDelegationAvailable(userAddress, gasLimit);
  }
}

export default VeChainCarbonCreditSDK;
