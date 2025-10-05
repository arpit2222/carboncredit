import { VeChainCarbonCreditSDK } from '../VeChainSDK';
import { 
  CarbonCreditNFTModule,
  OrganizationRegistryModule,
  FarmerRegistryModule,
  CarbonCreditVerifierModule,
  VeBetterIntegrationModule
} from '../contracts';
import { IPFSUtils } from './IPFSUtils';

/**
 * Carbon Credit Helper Functions
 * High-level helper functions for common carbon credit operations
 */

export interface MintCarbonCreditHelperParams {
  farmerId: number;
  orgId: number;
  carbonAmount: string;
  location: string;
  projectType: number;
  projectDescription: string;
  technicalDocuments: File | string;
  fieldEvidence: File | string;
  monitoringPlan: File | string;
  tokenMetadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface RegisterOrganizationHelperParams {
  name: string;
  walletAddress: string;
  kycDocuments: File | string;
  description?: string;
  website?: string;
  contactInfo?: string;
}

export interface RegisterFarmerHelperParams {
  name: string;
  location: string;
  walletAddress: string;
  landSize: string;
  associatedOrg: number;
  verificationDocuments: File | string;
  description?: string;
  contactInfo?: string;
}

export interface SubmitVerificationRequestHelperParams {
  farmerId: number;
  orgId: number;
  carbonAmount: string;
  location: string;
  projectType: number;
  projectDescription: string;
  technicalDocuments: File | string;
  fieldEvidence: File | string;
  monitoringPlan: File | string;
}

export interface ClaimRewardsHelperParams {
  userAddress: string;
}

export class CarbonCreditHelpers {
  private sdk: VeChainCarbonCreditSDK;
  private nftModule: CarbonCreditNFTModule;
  private orgModule: OrganizationRegistryModule;
  private farmerModule: FarmerRegistryModule;
  private verifierModule: CarbonCreditVerifierModule;
  private veBetterModule: VeBetterIntegrationModule;
  private ipfsUtils: IPFSUtils;

  constructor(sdk: VeChainCarbonCreditSDK) {
    this.sdk = sdk;
    this.nftModule = new CarbonCreditNFTModule(sdk);
    this.orgModule = new OrganizationRegistryModule(sdk);
    this.farmerModule = new FarmerRegistryModule(sdk);
    this.verifierModule = new CarbonCreditVerifierModule(sdk);
    this.veBetterModule = new VeBetterIntegrationModule(sdk);
    this.ipfsUtils = new IPFSUtils(sdk['config'].ipfsProvider, sdk['config'].ipfsConfig);
  }

  /**
   * Complete workflow: Register organization and farmer, then mint carbon credit
   */
  async completeCarbonCreditWorkflow(params: {
    organization: RegisterOrganizationHelperParams;
    farmer: RegisterFarmerHelperParams;
    carbonCredit: MintCarbonCreditHelperParams;
  }): Promise<{
    organizationId: number;
    farmerId: number;
    tokenId: number;
    transactionHashes: string[];
  }> {
    const transactionHashes: string[] = [];

    try {
      // Step 1: Register organization
      console.log('📝 Registering organization...');
      const orgTxHash = await this.registerOrganization(params.organization);
      transactionHashes.push(orgTxHash);
      
      // Get organization ID (simplified - in reality you'd need to parse events)
      const organizationId = await this.getLatestOrganizationId();

      // Step 2: Register farmer
      console.log('👨‍🌾 Registering farmer...');
      const farmerParams = {
        ...params.farmer,
        associatedOrg: organizationId
      };
      const farmerTxHash = await this.registerFarmer(farmerParams);
      transactionHashes.push(farmerTxHash);
      
      // Get farmer ID
      const farmerId = await this.getLatestFarmerId();

      // Step 3: Submit verification request
      console.log('🔍 Submitting verification request...');
      const verificationParams = {
        ...params.carbonCredit,
        farmerId,
        orgId: organizationId
      };
      const verificationTxHash = await this.submitVerificationRequest(verificationParams);
      transactionHashes.push(verificationTxHash);

      // Step 4: Approve verification (simplified - in reality this would be done by verifiers)
      console.log('✅ Approving verification...');
      const requestId = await this.getLatestVerificationRequestId();
      const approvalTxHash = await this.approveVerificationRequest(requestId);
      transactionHashes.push(approvalTxHash);

      // Get token ID
      const tokenId = await this.getLatestTokenId();

      console.log('🎉 Carbon credit workflow completed successfully!');
      
      return {
        organizationId,
        farmerId,
        tokenId,
        transactionHashes
      };
    } catch (error) {
      console.error('❌ Carbon credit workflow failed:', error);
      throw error;
    }
  }

  /**
   * Register organization with IPFS document upload
   */
  async registerOrganization(params: RegisterOrganizationHelperParams): Promise<string> {
    try {
      // Upload KYC documents to IPFS
      console.log('📤 Uploading KYC documents to IPFS...');
      const kycDocumentsHash = await this.ipfsUtils.uploadFile(params.kycDocuments);
      
      // Register organization
      const txHash = await this.orgModule.registerOrganization({
        name: params.name,
        walletAddress: params.walletAddress,
        kycDocumentsHash
      });

      console.log(`✅ Organization registered successfully: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to register organization:', error);
      throw error;
    }
  }

  /**
   * Register farmer with IPFS document upload
   */
  async registerFarmer(params: RegisterFarmerHelperParams): Promise<string> {
    try {
      // Upload verification documents to IPFS
      console.log('📤 Uploading verification documents to IPFS...');
      const verificationDocumentsHash = await this.ipfsUtils.uploadFile(params.verificationDocuments);
      
      // Register farmer
      const txHash = await this.farmerModule.registerFarmer({
        name: params.name,
        location: params.location,
        walletAddress: params.walletAddress,
        landSize: params.landSize,
        associatedOrg: params.associatedOrg,
        verificationDocumentsHash
      });

      console.log(`✅ Farmer registered successfully: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to register farmer:', error);
      throw error;
    }
  }

  /**
   * Submit verification request with IPFS document uploads
   */
  async submitVerificationRequest(params: SubmitVerificationRequestHelperParams): Promise<string> {
    try {
      // Upload all documents to IPFS
      console.log('📤 Uploading verification documents to IPFS...');
      const [technicalDocumentsHash, fieldEvidenceHash, monitoringPlanHash] = await Promise.all([
        this.ipfsUtils.uploadFile(params.technicalDocuments),
        this.ipfsUtils.uploadFile(params.fieldEvidence),
        this.ipfsUtils.uploadFile(params.monitoringPlan)
      ]);
      
      // Submit verification request
      const txHash = await this.verifierModule.submitVerificationRequest({
        farmerId: params.farmerId,
        orgId: params.orgId,
        carbonAmount: params.carbonAmount,
        location: params.location,
        projectType: params.projectType,
        projectDescription: params.projectDescription,
        technicalDocumentsHash,
        fieldEvidenceHash,
        monitoringPlanHash
      });

      console.log(`✅ Verification request submitted successfully: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to submit verification request:', error);
      throw error;
    }
  }

  /**
   * Approve verification request and mint NFT
   */
  async approveVerificationRequest(requestId: number): Promise<string> {
    try {
      // Create token metadata
      const tokenMetadata = {
        name: `Carbon Credit #${requestId}`,
        description: 'Verified carbon credit token',
        image: 'ipfs://QmDefaultImageHash',
        attributes: [
          { trait_type: 'Carbon Amount', value: '1000' },
          { trait_type: 'Project Type', value: 'Reforestation' },
          { trait_type: 'Verification Status', value: 'Verified' }
        ]
      };

      // Upload token metadata to IPFS
      console.log('📤 Uploading token metadata to IPFS...');
      const tokenURI = await this.ipfsUtils.uploadJSON(tokenMetadata);
      
      // Approve verification request
      const txHash = await this.verifierModule.approveVerificationRequest({
        requestId,
        tokenURI
      });

      console.log(`✅ Verification request approved successfully: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to approve verification request:', error);
      throw error;
    }
  }

  /**
   * Claim B3TR rewards for a user
   */
  async claimRewards(params: ClaimRewardsHelperParams): Promise<string> {
    try {
      // Check if user has pending rewards
      const rewardInfo = await this.veBetterModule.getUserRewardInfo(params.userAddress);
      
      if (BigInt(rewardInfo.pendingRewards) === BigInt(0)) {
        throw new Error('No pending rewards to claim');
      }

      // Claim rewards
      const txHash = await this.veBetterModule.claimRewards(params);
      
      console.log(`✅ Rewards claimed successfully: ${txHash}`);
      console.log(`💰 Amount claimed: ${rewardInfo.pendingRewards} B3TR`);
      
      return txHash;
    } catch (error) {
      console.error('❌ Failed to claim rewards:', error);
      throw error;
    }
  }

  /**
   * Bridge carbon credit to another chain
   */
  async bridgeCarbonCredit(
    tokenId: number,
    recipient: string,
    destinationChainId: number
  ): Promise<string> {
    try {
      // Check if token exists and is not locked
      const isLocked = await this.nftModule.isTokenLocked(tokenId);
      if (isLocked) {
        throw new Error('Token is already locked for bridging');
      }

      // Generate bridge transaction ID
      const bridgeTransactionId = Date.now();

      // Lock token for bridge
      const txHash = await this.nftModule.lockTokenForBridge({
        tokenId,
        recipient,
        destinationChainId,
        bridgeTransactionId
      });

      console.log(`✅ Carbon credit locked for bridge: ${txHash}`);
      console.log(`🌉 Bridge Transaction ID: ${bridgeTransactionId}`);
      console.log(`📍 Destination Chain: ${destinationChainId}`);
      console.log(`👤 Recipient: ${recipient}`);
      
      return txHash;
    } catch (error) {
      console.error('❌ Failed to bridge carbon credit:', error);
      throw error;
    }
  }

  /**
   * Get user's carbon credit portfolio
   */
  async getUserPortfolio(userAddress: string): Promise<{
    totalTokens: number;
    totalCarbonAmount: string;
    tokens: Array<{
      tokenId: number;
      carbonAmount: string;
      location: string;
      projectType: number;
      verificationStatus: number;
      bridgeStatus: number;
    }>;
  }> {
    try {
      const tokenIds = await this.nftModule.getTokensByOwner(userAddress);
      const tokens = [];
      let totalCarbonAmount = BigInt(0);

      for (const tokenId of tokenIds) {
        const metadata = await this.nftModule.getCreditMetadata(tokenId);
        tokens.push({
          tokenId,
          carbonAmount: metadata.carbonAmount,
          location: metadata.location,
          projectType: metadata.projectType,
          verificationStatus: metadata.verificationStatus,
          bridgeStatus: metadata.bridgeStatus
        });
        
        totalCarbonAmount += BigInt(metadata.carbonAmount);
      }

      return {
        totalTokens: tokenIds.length,
        totalCarbonAmount: totalCarbonAmount.toString(),
        tokens
      };
    } catch (error) {
      console.error('❌ Failed to get user portfolio:', error);
      throw error;
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStatistics(): Promise<{
    totalTokens: number;
    totalOrganizations: number;
    totalFarmers: number;
    totalVerificationRequests: number;
    totalRewardsDistributed: string;
    bridgeStatistics: {
      totalBridged: number;
      totalLocked: number;
    };
  }> {
    try {
      const [
        totalTokens,
        orgStats,
        farmerStats,
        totalVerificationRequests,
        totalRewardsDistributed,
        bridgeStatistics
      ] = await Promise.all([
        this.sdk.getTotalSupply(),
        this.orgModule.getOrganizationStatistics(),
        this.farmerModule.getFarmerStatistics(),
        this.verifierModule.getTotalVerificationRequests(),
        this.veBetterModule.getTotalRewardsDistributed(),
        this.nftModule.getBridgeStatistics()
      ]);

      return {
        totalTokens,
        totalOrganizations: orgStats.totalOrganizations,
        totalFarmers: farmerStats.totalFarmers,
        totalVerificationRequests,
        totalRewardsDistributed,
        bridgeStatistics
      };
    } catch (error) {
      console.error('❌ Failed to get system statistics:', error);
      throw error;
    }
  }

  /**
   * Get latest organization ID (simplified implementation)
   */
  private async getLatestOrganizationId(): Promise<number> {
    const total = await this.orgModule.getTotalOrganizations();
    return total;
  }

  /**
   * Get latest farmer ID (simplified implementation)
   */
  private async getLatestFarmerId(): Promise<number> {
    const total = await this.farmerModule.getTotalFarmers();
    return total;
  }

  /**
   * Get latest verification request ID (simplified implementation)
   */
  private async getLatestVerificationRequestId(): Promise<number> {
    const total = await this.verifierModule.getTotalVerificationRequests();
    return total;
  }

  /**
   * Get latest token ID (simplified implementation)
   */
  private async getLatestTokenId(): Promise<number> {
    const total = await this.sdk.getTotalSupply();
    return total;
  }
}

export default CarbonCreditHelpers;
