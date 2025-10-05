# VeChain Carbon Credit SDK - API Reference

## Table of Contents

- [VeChainCarbonCreditSDK](#vechaincarboncreditsdk)
- [Contract Modules](#contract-modules)
- [Helper Functions](#helper-functions)
- [IPFS Utilities](#ipfs-utilities)
- [Wallet Integration](#wallet-integration)
- [Types and Interfaces](#types-and-interfaces)

## VeChainCarbonCreditSDK

The main SDK class that provides access to all functionality.

### Constructor

```typescript
new VeChainCarbonCreditSDK(config: SDKConfig, contractAddresses: ContractAddresses)
```

### Methods

#### getNetworkConfig()

Returns the current network configuration.

```typescript
getNetworkConfig(): VeChainConfig
```

#### getContractAddresses()

Returns the contract addresses.

```typescript
getContractAddresses(): ContractAddresses
```

#### isFeeDelegationEnabled()

Checks if fee delegation is enabled.

```typescript
isFeeDelegationEnabled(): boolean
```

#### isBridgeEnabled()

Checks if bridge functionality is enabled.

```typescript
isBridgeEnabled(): boolean
```

#### getFeeDelegationManager()

Returns the fee delegation manager instance.

```typescript
getFeeDelegationManager(): VeChainFeeDelegation | undefined
```

#### getBridgeManager()

Returns the bridge manager instance.

```typescript
getBridgeManager(): WanchainBridgeManager | undefined
```

#### getEventManager()

Returns the event manager instance.

```typescript
getEventManager(): BridgeEventManager | undefined
```

#### getVETBalance(address: string)

Gets the VET balance for an address.

```typescript
getVETBalance(address: string): Promise<string>
```

#### getVTHOBalance(address: string)

Gets the VTHO balance for an address.

```typescript
getVTHOBalance(address: string): Promise<string>
```

#### getCarbonCreditMetadata(tokenId: number)

Gets carbon credit NFT metadata.

```typescript
getCarbonCreditMetadata(tokenId: number): Promise<CarbonCreditMetadata>
```

#### getOrganizationProfile(orgId: number)

Gets organization profile information.

```typescript
getOrganizationProfile(orgId: number): Promise<OrganizationProfile>
```

#### getFarmerProfile(farmerId: number)

Gets farmer profile information.

```typescript
getFarmerProfile(farmerId: number): Promise<FarmerProfile>
```

#### getVerificationRequest(requestId: number)

Gets verification request details.

```typescript
getVerificationRequest(requestId: number): Promise<VerificationRequest>
```

#### getUserRewardInfo(userAddress: string)

Gets user reward information.

```typescript
getUserRewardInfo(userAddress: string): Promise<UserRewardInfo>
```

#### getTotalSupply()

Gets the total supply of carbon credit NFTs.

```typescript
getTotalSupply(): Promise<number>
```

#### getBridgeStatistics()

Gets bridge statistics.

```typescript
getBridgeStatistics(): Promise<{ totalBridged: number; totalLocked: number }>
```

#### isTokenLocked(tokenId: number)

Checks if a token is locked for bridging.

```typescript
isTokenLocked(tokenId: number): Promise<boolean>
```

#### getBridgeInfo(tokenId: number)

Gets bridge information for a token.

```typescript
getBridgeInfo(tokenId: number): Promise<{
  recipient: string;
  destinationChainId: number;
  bridgeStatus: number;
  bridgeTransactionId: number;
  bridgeTimestamp: number;
}>
```

#### getB3TRBalance()

Gets B3TR token balance in the reward pool.

```typescript
getB3TRBalance(): Promise<string>
```

#### calculatePotentialReward(carbonAmount: string, isVerified: boolean)

Calculates potential B3TR reward.

```typescript
calculatePotentialReward(carbonAmount: string, isVerified: boolean): Promise<string>
```

#### getAvailableGasForDelegation(sponsorAddress: string)

Gets available gas for delegation.

```typescript
getAvailableGasForDelegation(sponsorAddress: string): Promise<number>
```

#### isDelegationAvailable(userAddress: string, gasLimit: number)

Checks if delegation is available for a user.

```typescript
isDelegationAvailable(userAddress: string, gasLimit: number): Promise<boolean>
```

## Contract Modules

### CarbonCreditNFTModule

Handles all interactions with the CarbonCreditNFT contract.

#### Constructor

```typescript
new CarbonCreditNFTModule(sdk: VeChainCarbonCreditSDK)
```

#### Methods

##### mintCarbonCredit(params: MintCarbonCreditParams)

Mints a new carbon credit NFT.

```typescript
mintCarbonCredit(params: MintCarbonCreditParams): Promise<string>
```

##### burnCarbonCredit(params: BurnCarbonCreditParams)

Burns a carbon credit NFT.

```typescript
burnCarbonCredit(params: BurnCarbonCreditParams): Promise<string>
```

##### retireCarbonCredit(params: RetireCarbonCreditParams)

Retires a carbon credit NFT.

```typescript
retireCarbonCredit(params: RetireCarbonCreditParams): Promise<string>
```

##### updateVerificationStatus(params: UpdateVerificationStatusParams)

Updates verification status of a carbon credit.

```typescript
updateVerificationStatus(params: UpdateVerificationStatusParams): Promise<string>
```

##### lockTokenForBridge(params: BridgeTokenParams)

Locks token for cross-chain bridging.

```typescript
lockTokenForBridge(params: BridgeTokenParams): Promise<string>
```

##### unlockTokenFromBridge(tokenId: number, recipient: string, sourceChainId: number, bridgeTransactionId: number)

Unlocks token from bridge.

```typescript
unlockTokenFromBridge(tokenId: number, recipient: string, sourceChainId: number, bridgeTransactionId: number): Promise<string>
```

##### updateBridgeStatus(tokenId: number, newStatus: number, bridgeTransactionId: number)

Updates bridge status.

```typescript
updateBridgeStatus(tokenId: number, newStatus: number, bridgeTransactionId: number): Promise<string>
```

##### transferFrom(from: string, to: string, tokenId: number)

Transfers carbon credit NFT.

```typescript
transferFrom(from: string, to: string, tokenId: number): Promise<string>
```

##### approve(to: string, tokenId: number)

Approves carbon credit NFT for transfer.

```typescript
approve(to: string, tokenId: number): Promise<string>
```

##### setApprovalForAll(operator: string, approved: boolean)

Sets approval for all tokens.

```typescript
setApprovalForAll(operator: string, approved: boolean): Promise<string>
```

##### ownerOf(tokenId: number)

Gets owner of a token.

```typescript
ownerOf(tokenId: number): Promise<string>
```

##### tokenURI(tokenId: number)

Gets token URI.

```typescript
tokenURI(tokenId: number): Promise<string>
```

##### balanceOf(owner: string)

Gets balance of an address.

```typescript
balanceOf(owner: string): Promise<number>
```

##### getApproved(tokenId: number)

Gets approved address for a token.

```typescript
getApproved(tokenId: number): Promise<string>
```

##### isApprovedForAll(owner: string, operator: string)

Checks if operator is approved for all tokens.

```typescript
isApprovedForAll(owner: string, operator: string): Promise<boolean>
```

##### getTokensByOwner(owner: string)

Gets tokens owned by an address.

```typescript
getTokensByOwner(owner: string): Promise<number[]>
```

##### getCreditMetadata(tokenId: number)

Gets carbon credit metadata.

```typescript
getCreditMetadata(tokenId: number): Promise<CarbonCreditMetadata>
```

##### isTokenLocked(tokenId: number)

Checks if token is locked.

```typescript
isTokenLocked(tokenId: number): Promise<boolean>
```

##### getBridgeInfo(tokenId: number)

Gets bridge information.

```typescript
getBridgeInfo(tokenId: number): Promise<BridgeInfo>
```

##### getBridgeStatistics()

Gets bridge statistics.

```typescript
getBridgeStatistics(): Promise<{ totalBridged: number; totalLocked: number }>
```

### OrganizationRegistryModule

Manages organization registrations and profiles.

#### Constructor

```typescript
new OrganizationRegistryModule(sdk: VeChainCarbonCreditSDK)
```

#### Methods

##### registerOrganization(params: RegisterOrganizationParams)

Registers a new organization.

```typescript
registerOrganization(params: RegisterOrganizationParams): Promise<string>
```

##### updateOrganization(params: UpdateOrganizationParams)

Updates organization information.

```typescript
updateOrganization(params: UpdateOrganizationParams): Promise<string>
```

##### verifyOrganization(params: VerifyOrganizationParams)

Verifies organization.

```typescript
verifyOrganization(params: VerifyOrganizationParams): Promise<string>
```

##### setOrganizationStatus(params: SetOrganizationStatusParams)

Sets organization status.

```typescript
setOrganizationStatus(params: SetOrganizationStatusParams): Promise<string>
```

##### updateCreditsGenerated(orgId: number, additionalCredits: string)

Updates credits generated by organization.

```typescript
updateCreditsGenerated(orgId: number, additionalCredits: string): Promise<string>
```

##### getOrganizationProfile(orgId: number)

Gets organization profile.

```typescript
getOrganizationProfile(orgId: number): Promise<OrganizationProfile>
```

##### getOrganizationByWallet(walletAddress: string)

Gets organization by wallet address.

```typescript
getOrganizationByWallet(walletAddress: string): Promise<number>
```

##### organizationExists(orgId: number)

Checks if organization exists.

```typescript
organizationExists(orgId: number): Promise<boolean>
```

##### getTotalOrganizations()

Gets total number of organizations.

```typescript
getTotalOrganizations(): Promise<number>
```

##### getAllOrganizationIds()

Gets all organization IDs.

```typescript
getAllOrganizationIds(): Promise<number[]>
```

##### getOrganizationsByStatus(verificationStatus: number)

Gets organizations by verification status.

```typescript
getOrganizationsByStatus(verificationStatus: number): Promise<number[]>
```

##### getVerifiedOrganizations()

Gets verified organizations.

```typescript
getVerifiedOrganizations(): Promise<number[]>
```

##### getPendingOrganizations()

Gets pending organizations.

```typescript
getPendingOrganizations(): Promise<number[]>
```

##### getRejectedOrganizations()

Gets rejected organizations.

```typescript
getRejectedOrganizations(): Promise<number[]>
```

##### searchOrganizationsByName(searchTerm: string)

Searches organizations by name.

```typescript
searchOrganizationsByName(searchTerm: string): Promise<number[]>
```

##### getOrganizationStatistics()

Gets organization statistics.

```typescript
getOrganizationStatistics(): Promise<{
  totalOrganizations: number;
  verifiedOrganizations: number;
  pendingOrganizations: number;
  rejectedOrganizations: number;
  totalCreditsGenerated: string;
}>
```

### FarmerRegistryModule

Manages farmer registrations and profiles.

#### Constructor

```typescript
new FarmerRegistryModule(sdk: VeChainCarbonCreditSDK)
```

#### Methods

##### registerFarmer(params: RegisterFarmerParams)

Registers a new farmer.

```typescript
registerFarmer(params: RegisterFarmerParams): Promise<string>
```

##### updateFarmer(params: UpdateFarmerParams)

Updates farmer information.

```typescript
updateFarmer(params: UpdateFarmerParams): Promise<string>
```

##### updateOrganizationAssociation(params: UpdateOrganizationAssociationParams)

Updates farmer's organization association.

```typescript
updateOrganizationAssociation(params: UpdateOrganizationAssociationParams): Promise<string>
```

##### verifyFarmer(params: VerifyFarmerParams)

Verifies farmer.

```typescript
verifyFarmer(params: VerifyFarmerParams): Promise<string>
```

##### setFarmerStatus(params: SetFarmerStatusParams)

Sets farmer status.

```typescript
setFarmerStatus(params: SetFarmerStatusParams): Promise<string>
```

##### getFarmerProfile(farmerId: number)

Gets farmer profile.

```typescript
getFarmerProfile(farmerId: number): Promise<FarmerProfile>
```

##### getFarmerByWallet(walletAddress: string)

Gets farmer by wallet address.

```typescript
getFarmerByWallet(walletAddress: string): Promise<number>
```

##### farmerExists(farmerId: number)

Checks if farmer exists.

```typescript
farmerExists(farmerId: number): Promise<boolean>
```

##### getTotalFarmers()

Gets total number of farmers.

```typescript
getTotalFarmers(): Promise<number>
```

##### getAllFarmerIds()

Gets all farmer IDs.

```typescript
getAllFarmerIds(): Promise<number[]>
```

##### getFarmersByStatus(verificationStatus: number)

Gets farmers by verification status.

```typescript
getFarmersByStatus(verificationStatus: number): Promise<number[]>
```

##### getVerifiedFarmers()

Gets verified farmers.

```typescript
getVerifiedFarmers(): Promise<number[]>
```

##### getPendingFarmers()

Gets pending farmers.

```typescript
getPendingFarmers(): Promise<number[]>
```

##### getRejectedFarmers()

Gets rejected farmers.

```typescript
getRejectedFarmers(): Promise<number[]>
```

##### getFarmersByOrganization(orgId: number)

Gets farmers by organization.

```typescript
getFarmersByOrganization(orgId: number): Promise<number[]>
```

##### getIndependentFarmers()

Gets independent farmers.

```typescript
getIndependentFarmers(): Promise<number[]>
```

##### searchFarmersByName(searchTerm: string)

Searches farmers by name.

```typescript
searchFarmersByName(searchTerm: string): Promise<number[]>
```

##### searchFarmersByLocation(searchTerm: string)

Searches farmers by location.

```typescript
searchFarmersByLocation(searchTerm: string): Promise<number[]>
```

##### getFarmersByLandSizeRange(minLandSize: string, maxLandSize: string)

Gets farmers by land size range.

```typescript
getFarmersByLandSizeRange(minLandSize: string, maxLandSize: string): Promise<number[]>
```

##### getFarmerStatistics()

Gets farmer statistics.

```typescript
getFarmerStatistics(): Promise<{
  totalFarmers: number;
  verifiedFarmers: number;
  pendingFarmers: number;
  rejectedFarmers: number;
  independentFarmers: number;
  totalLandSize: string;
  averageLandSize: string;
}>
```

### CarbonCreditVerifierModule

Handles verification requests and approval workflow.

#### Constructor

```typescript
new CarbonCreditVerifierModule(sdk: VeChainCarbonCreditSDK)
```

#### Methods

##### submitVerificationRequest(params: SubmitVerificationRequestParams)

Submits a verification request.

```typescript
submitVerificationRequest(params: SubmitVerificationRequestParams): Promise<string>
```

##### assignVerifier(params: AssignVerifierParams)

Assigns verifier to a request.

```typescript
assignVerifier(params: AssignVerifierParams): Promise<string>
```

##### updateVerificationStage(params: UpdateVerificationStageParams)

Updates verification stage.

```typescript
updateVerificationStage(params: UpdateVerificationStageParams): Promise<string>
```

##### approveVerificationRequest(params: ApproveVerificationRequestParams)

Approves verification request.

```typescript
approveVerificationRequest(params: ApproveVerificationRequestParams): Promise<string>
```

##### rejectVerificationRequest(params: RejectVerificationRequestParams)

Rejects verification request.

```typescript
rejectVerificationRequest(params: RejectVerificationRequestParams): Promise<string>
```

##### recordGasSponsored(requestId: number, gasUsed: number, gasPrice: string)

Records gas sponsored.

```typescript
recordGasSponsored(requestId: number, gasUsed: number, gasPrice: string): Promise<string>
```

##### getVerificationRequest(requestId: number)

Gets verification request.

```typescript
getVerificationRequest(requestId: number): Promise<VerificationRequest>
```

##### getTotalVerificationRequests()

Gets total verification requests.

```typescript
getTotalVerificationRequests(): Promise<number>
```

##### getVerificationRequestsByStage(stage: number)

Gets verification requests by stage.

```typescript
getVerificationRequestsByStage(stage: number): Promise<number[]>
```

##### getVerificationRequestsByVerifier(verifierAddress: string)

Gets verification requests by verifier.

```typescript
getVerificationRequestsByVerifier(verifierAddress: string): Promise<number[]>
```

##### getVerificationRequestsBySubmitter(submitterAddress: string)

Gets verification requests by submitter.

```typescript
getVerificationRequestsBySubmitter(submitterAddress: string): Promise<number[]>
```

##### getPendingVerificationRequests()

Gets pending verification requests.

```typescript
getPendingVerificationRequests(): Promise<number[]>
```

##### getApprovedVerificationRequests()

Gets approved verification requests.

```typescript
getApprovedVerificationRequests(): Promise<number[]>
```

##### getRejectedVerificationRequests()

Gets rejected verification requests.

```typescript
getRejectedVerificationRequests(): Promise<number[]>
```

##### getTechnicalReviewRequests()

Gets technical review requests.

```typescript
getTechnicalReviewRequests(): Promise<number[]>
```

##### getFieldVerificationRequests()

Gets field verification requests.

```typescript
getFieldVerificationRequests(): Promise<number[]>
```

##### getFinalReviewRequests()

Gets final review requests.

```typescript
getFinalReviewRequests(): Promise<number[]>
```

##### isVerifierAssigned(requestId: number, verifierAddress: string)

Checks if verifier is assigned.

```typescript
isVerifierAssigned(requestId: number, verifierAddress: string): Promise<boolean>
```

##### getVerificationStatistics()

Gets verification statistics.

```typescript
getVerificationStatistics(): Promise<{
  totalRequests: number;
  pendingRequests: number;
  technicalReviewRequests: number;
  fieldVerificationRequests: number;
  finalReviewRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalCarbonCredits: string;
  averageProcessingTime: number;
}>
```

### VeBetterIntegrationModule

Manages B3TR token rewards and distribution.

#### Constructor

```typescript
new VeBetterIntegrationModule(sdk: VeChainCarbonCreditSDK)
```

#### Methods

##### claimRewards(params: ClaimRewardsParams)

Claims B3TR rewards.

```typescript
claimRewards(params: ClaimRewardsParams): Promise<string>
```

##### batchClaimRewards(params: BatchClaimRewardsParams)

Batch claims B3TR rewards.

```typescript
batchClaimRewards(params: BatchClaimRewardsParams): Promise<string>
```

##### updateRewardConfig(params: UpdateRewardConfigParams)

Updates reward configuration.

```typescript
updateRewardConfig(params: UpdateRewardConfigParams): Promise<string>
```

##### setUserActive(params: SetUserActiveParams)

Sets user active status.

```typescript
setUserActive(params: SetUserActiveParams): Promise<string>
```

##### depositB3TR(params: DepositB3TRParams)

Deposits B3TR tokens.

```typescript
depositB3TR(params: DepositB3TRParams): Promise<string>
```

##### getUserRewardInfo(userAddress: string)

Gets user reward information.

```typescript
getUserRewardInfo(userAddress: string): Promise<UserRewardInfo>
```

##### getB3TRBalance()

Gets B3TR token balance.

```typescript
getB3TRBalance(): Promise<string>
```

##### calculatePotentialReward(carbonAmount: string, isVerified: boolean)

Calculates potential reward.

```typescript
calculatePotentialReward(carbonAmount: string, isVerified: boolean): Promise<string>
```

##### getRewardConfig()

Gets reward configuration.

```typescript
getRewardConfig(): Promise<{
  baseRewardRate: string;
  verificationBonus: string;
  maxRewardPerCredit: string;
  minRewardPerCredit: string;
  totalRewardsDistributed: string;
  totalUsers: number;
  activeUsers: number;
}>
```

##### getTotalRewardsDistributed()

Gets total rewards distributed.

```typescript
getTotalRewardsDistributed(): Promise<string>
```

##### getTotalUsers()

Gets total number of users.

```typescript
getTotalUsers(): Promise<number>
```

##### getActiveUsers()

Gets number of active users.

```typescript
getActiveUsers(): Promise<number>
```

##### isUserActive(userAddress: string)

Checks if user is active.

```typescript
isUserActive(userAddress: string): Promise<boolean>
```

##### getUserTotalEarned(userAddress: string)

Gets user's total earned rewards.

```typescript
getUserTotalEarned(userAddress: string): Promise<string>
```

##### getUserPendingRewards(userAddress: string)

Gets user's pending rewards.

```typescript
getUserPendingRewards(userAddress: string): Promise<string>
```

##### getUserTotalClaimed(userAddress: string)

Gets user's total claimed rewards.

```typescript
getUserTotalClaimed(userAddress: string): Promise<string>
```

##### getUserLastClaimTime(userAddress: string)

Gets user's last claim time.

```typescript
getUserLastClaimTime(userAddress: string): Promise<number>
```

##### getUserTotalCarbonCredits(userAddress: string)

Gets user's total carbon credits.

```typescript
getUserTotalCarbonCredits(userAddress: string): Promise<string>
```

##### getUserRewardEligibleCredits(userAddress: string)

Gets user's reward eligible credits.

```typescript
getUserRewardEligibleCredits(userAddress: string): Promise<string>
```

##### getRewardStatistics()

Gets reward statistics.

```typescript
getRewardStatistics(): Promise<{
  totalRewardsDistributed: string;
  totalUsers: number;
  activeUsers: number;
  averageRewardPerUser: string;
  totalCarbonCredits: string;
  rewardEligibleCredits: string;
  b3trBalance: string;
}>
```

##### getTopRewardEarners(limit?: number)

Gets top reward earners.

```typescript
getTopRewardEarners(limit?: number): Promise<Array<{
  userAddress: string;
  totalEarned: string;
  totalClaimed: string;
  pendingRewards: string;
}>>
```

##### getRewardDistributionHistory(userAddress: string, limit?: number)

Gets reward distribution history.

```typescript
getRewardDistributionHistory(userAddress: string, limit?: number): Promise<Array<{
  timestamp: number;
  amount: string;
  transactionHash: string;
}>>
```

## Helper Functions

### CarbonCreditHelpers

High-level helper functions for common operations.

#### Constructor

```typescript
new CarbonCreditHelpers(sdk: VeChainCarbonCreditSDK)
```

#### Methods

##### completeCarbonCreditWorkflow(params)

Completes the full carbon credit workflow.

```typescript
completeCarbonCreditWorkflow(params: {
  organization: RegisterOrganizationHelperParams;
  farmer: RegisterFarmerHelperParams;
  carbonCredit: MintCarbonCreditHelperParams;
}): Promise<{
  organizationId: number;
  farmerId: number;
  tokenId: number;
  transactionHashes: string[];
}>
```

##### registerOrganization(params: RegisterOrganizationHelperParams)

Registers organization with IPFS document upload.

```typescript
registerOrganization(params: RegisterOrganizationHelperParams): Promise<string>
```

##### registerFarmer(params: RegisterFarmerHelperParams)

Registers farmer with IPFS document upload.

```typescript
registerFarmer(params: RegisterFarmerHelperParams): Promise<string>
```

##### submitVerificationRequest(params: SubmitVerificationRequestHelperParams)

Submits verification request with IPFS document uploads.

```typescript
submitVerificationRequest(params: SubmitVerificationRequestHelperParams): Promise<string>
```

##### approveVerificationRequest(requestId: number)

Approves verification request and mints NFT.

```typescript
approveVerificationRequest(requestId: number): Promise<string>
```

##### claimRewards(params: ClaimRewardsHelperParams)

Claims B3TR rewards.

```typescript
claimRewards(params: ClaimRewardsHelperParams): Promise<string>
```

##### bridgeCarbonCredit(tokenId: number, recipient: string, destinationChainId: number)

Bridges carbon credit to another chain.

```typescript
bridgeCarbonCredit(tokenId: number, recipient: string, destinationChainId: number): Promise<string>
```

##### getUserPortfolio(userAddress: string)

Gets user's carbon credit portfolio.

```typescript
getUserPortfolio(userAddress: string): Promise<{
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
}>
```

##### getSystemStatistics()

Gets system statistics.

```typescript
getSystemStatistics(): Promise<{
  totalTokens: number;
  totalOrganizations: number;
  totalFarmers: number;
  totalVerificationRequests: number;
  totalRewardsDistributed: string;
  bridgeStatistics: {
    totalBridged: number;
    totalLocked: number;
  };
}>
```

## IPFS Utilities

### IPFSUtils

Handles file uploads to IPFS using Pinata or Web3.Storage.

#### Constructor

```typescript
new IPFSUtils(provider: 'pinata' | 'web3storage', config: IPFSConfig)
```

#### Methods

##### uploadFile(file: File | string)

Uploads file to IPFS.

```typescript
uploadFile(file: File | string): Promise<string>
```

##### uploadJSON(data: any)

Uploads JSON object to IPFS.

```typescript
uploadJSON(data: any): Promise<string>
```

##### uploadImage(imageFile: File)

Uploads image to IPFS.

```typescript
uploadImage(imageFile: File): Promise<string>
```

##### uploadDocument(documentFile: File)

Uploads document to IPFS.

```typescript
uploadDocument(documentFile: File): Promise<string>
```

##### uploadMultipleFiles(files: File[])

Uploads multiple files to IPFS.

```typescript
uploadMultipleFiles(files: File[]): Promise<string[]>
```

##### getIPFSUrl(hash: string)

Gets IPFS URL from hash.

```typescript
getIPFSUrl(hash: string): string
```

##### getFileSize(hash: string)

Gets file size from IPFS.

```typescript
getFileSize(hash: string): Promise<number>
```

##### fileExists(hash: string)

Checks if file exists on IPFS.

```typescript
fileExists(hash: string): Promise<boolean>
```

##### downloadFile(hash: string)

Downloads file from IPFS.

```typescript
downloadFile(hash: string): Promise<Blob>
```

##### getFileMetadata(hash: string)

Gets file metadata from IPFS.

```typescript
getFileMetadata(hash: string): Promise<{
  size: number;
  type: string;
  lastModified: Date;
}>
```

#### Static Methods

##### validateIPFSHash(hash: string)

Validates IPFS hash.

```typescript
static validateIPFSHash(hash: string): boolean
```

##### extractHashFromUrl(url: string)

Extracts hash from IPFS URL.

```typescript
static extractHashFromUrl(url: string): string | null
```

##### createCarbonCreditMetadata(params)

Creates carbon credit metadata JSON.

```typescript
static createCarbonCreditMetadata(params: {
  name: string;
  description: string;
  image: string;
  carbonAmount: string;
  location: string;
  projectType: string;
  verificationStatus: string;
  generationDate: string;
  expiryDate?: string;
  proofsIPFSHash: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}): any
```

##### createOrganizationMetadata(params)

Creates organization metadata JSON.

```typescript
static createOrganizationMetadata(params: {
  name: string;
  description: string;
  website?: string;
  contactInfo?: string;
  kycDocumentsHash: string;
}): any
```

##### createFarmerMetadata(params)

Creates farmer metadata JSON.

```typescript
static createFarmerMetadata(params: {
  name: string;
  location: string;
  landSize: string;
  description?: string;
  contactInfo?: string;
  verificationDocumentsHash: string;
}): any
```

## Wallet Integration

### VeWorldWallet

Handles wallet connection and transaction signing with VeWorld.

#### Constructor

```typescript
new VeWorldWallet(config: VeWorldWalletConfig)
```

#### Static Methods

##### isVeWorldAvailable()

Checks if VeWorld is available.

```typescript
static isVeWorldAvailable(): boolean
```

#### Methods

##### connect()

Connects to VeWorld wallet.

```typescript
connect(): Promise<WalletConnectionResult>
```

##### disconnect()

Disconnects from VeWorld wallet.

```typescript
disconnect(): Promise<void>
```

##### getConnectionStatus()

Gets current connection status.

```typescript
getConnectionStatus(): WalletConnectionResult
```

##### getVETBalance()

Gets account balance in VET.

```typescript
getVETBalance(): Promise<string>
```

##### getVTHOBalance()

Gets account balance in VTHO.

```typescript
getVTHOBalance(): Promise<string>
```

##### signTransaction(transaction)

Signs a transaction.

```typescript
signTransaction(transaction: {
  clauses: any[];
  gas?: number;
  gasPrice?: string;
}): Promise<string>
```

##### signMessage(message: string)

Signs a message.

```typescript
signMessage(message: string): Promise<string>
```

##### sendTransaction(transaction)

Sends transaction and waits for confirmation.

```typescript
sendTransaction(transaction: {
  clauses: any[];
  gas?: number;
  gasPrice?: string;
}): Promise<TransactionResult>
```

##### waitForTransaction(txid: string, timeout?: number)

Waits for transaction confirmation.

```typescript
waitForTransaction(txid: string, timeout?: number): Promise<{
  gasUsed: number;
  blockNumber: number;
  timestamp: number;
}>
```

##### getTransactionReceipt(txid: string)

Gets transaction receipt.

```typescript
getTransactionReceipt(txid: string): Promise<any>
```

##### getTransaction(txid: string)

Gets transaction details.

```typescript
getTransaction(txid: string): Promise<any>
```

##### switchNetwork(network: 'testnet' | 'mainnet' | 'solo')

Switches network.

```typescript
switchNetwork(network: 'testnet' | 'mainnet' | 'solo'): Promise<void>
```

##### getCurrentNetwork()

Gets current network.

```typescript
getCurrentNetwork(): Promise<string>
```

##### isWalletLocked()

Checks if wallet is locked.

```typescript
isWalletLocked(): Promise<boolean>
```

##### requestUnlock()

Requests wallet unlock.

```typescript
requestUnlock(): Promise<void>
```

##### getWalletVersion()

Gets wallet version.

```typescript
getWalletVersion(): Promise<string>
```

##### onAccountChange(callback)

Listens for account changes.

```typescript
onAccountChange(callback: (address: string) => void): void
```

##### onNetworkChange(callback)

Listens for network changes.

```typescript
onNetworkChange(callback: (network: string) => void): void
```

##### removeAllListeners()

Removes all event listeners.

```typescript
removeAllListeners(): void
```

## Types and Interfaces

### Core Types

```typescript
interface SDKConfig {
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

interface ContractAddresses {
  carbonCreditNFT: string;
  organizationRegistry: string;
  farmerRegistry: string;
  carbonCreditVerifier: string;
  feeDelegationManager: string;
  veBetterIntegration: string;
}

interface CarbonCreditMetadata {
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

interface OrganizationProfile {
  orgId: number;
  name: string;
  walletAddress: string;
  verificationStatus: number;
  totalCreditsGenerated: string;
  kycDocumentsHash: string;
  registrationDate: number;
  lastUpdated: number;
}

interface FarmerProfile {
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

interface VerificationRequest {
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

interface UserRewardInfo {
  totalEarned: string;
  totalClaimed: string;
  pendingRewards: string;
  lastClaimTime: number;
  totalCarbonCredits: string;
  rewardEligibleCredits: string;
  isActive: boolean;
}
```

### Contract Module Types

```typescript
interface MintCarbonCreditParams {
  to: string;
  carbonAmount: string;
  location: string;
  projectType: number;
  projectDescription: string;
  technicalDocumentsHash: string;
  fieldEvidenceHash: string;
  monitoringPlanHash: string;
  tokenURI: string;
}

interface RegisterOrganizationParams {
  name: string;
  walletAddress: string;
  kycDocumentsHash: string;
}

interface RegisterFarmerParams {
  name: string;
  location: string;
  walletAddress: string;
  landSize: string;
  associatedOrg: number;
  verificationDocumentsHash: string;
}

interface SubmitVerificationRequestParams {
  farmerId: number;
  orgId: number;
  carbonAmount: string;
  location: string;
  projectType: number;
  projectDescription: string;
  technicalDocumentsHash: string;
  fieldEvidenceHash: string;
  monitoringPlanHash: string;
}

interface ClaimRewardsParams {
  userAddress: string;
}
```

### Helper Function Types

```typescript
interface RegisterOrganizationHelperParams {
  name: string;
  walletAddress: string;
  kycDocuments: File | string;
  description?: string;
  website?: string;
  contactInfo?: string;
}

interface RegisterFarmerHelperParams {
  name: string;
  location: string;
  walletAddress: string;
  landSize: string;
  associatedOrg: number;
  verificationDocuments: File | string;
  description?: string;
  contactInfo?: string;
}

interface SubmitVerificationRequestHelperParams {
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
```

### IPFS Types

```typescript
interface IPFSConfig {
  pinataApiKey?: string;
  pinataSecretKey?: string;
  web3StorageToken?: string;
}

interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}
```

### Wallet Types

```typescript
interface VeWorldWalletConfig {
  network: 'testnet' | 'mainnet' | 'solo';
  connex: Connex;
}

interface WalletConnectionResult {
  address: string;
  publicKey: string;
  isConnected: boolean;
  network: string;
}

interface TransactionResult {
  txid: string;
  gasUsed: number;
  blockNumber: number;
  timestamp: number;
}
```
