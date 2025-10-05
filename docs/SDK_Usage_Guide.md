# VeChain Carbon Credit SDK - Usage Guide

## Overview

The VeChain Carbon Credit SDK provides a comprehensive JavaScript/TypeScript interface for interacting with the carbon credit system on VeChain. It includes wallet integration, contract interactions, IPFS utilities, and helper functions for common operations.

## Installation

```bash
npm install @vechain/sdk-core @vechain/connex ethers axios form-data
```

## Quick Start

### 1. Basic Setup

```typescript
import { VeChainCarbonCreditSDK, VeWorldWallet } from './src/sdk';
import { Connex } from '@vechain/connex';

// Initialize Connex
const connex = new Connex({
  node: 'https://testnet.veblocks.net',
  network: 'testnet'
});

// Initialize wallet
const wallet = new VeWorldWallet({
  network: 'testnet',
  connex
});

// Connect to wallet
await wallet.connect();

// Configure SDK
const contractAddresses = {
  carbonCreditNFT: '0x...',
  organizationRegistry: '0x...',
  farmerRegistry: '0x...',
  carbonCreditVerifier: '0x...',
  feeDelegationManager: '0x...',
  veBetterIntegration: '0x...'
};

const sdk = new VeChainCarbonCreditSDK({
  network: 'testnet',
  connex,
  feeDelegation: true,
  bridgeEnabled: true,
  ipfsProvider: 'pinata',
  ipfsConfig: {
    pinataApiKey: 'your-pinata-api-key',
    pinataSecretKey: 'your-pinata-secret-key'
  }
}, contractAddresses);
```

### 2. Register Organization and Farmer

```typescript
import { CarbonCreditHelpers } from './src/sdk';

const helpers = new CarbonCreditHelpers(sdk);

// Register organization
const orgTxHash = await helpers.registerOrganization({
  name: 'Green Energy Corp',
  walletAddress: wallet.getConnectionStatus().address,
  kycDocuments: new File(['KYC document content'], 'kyc.pdf', { type: 'application/pdf' }),
  description: 'Leading renewable energy company',
  website: 'https://greenenergy.com',
  contactInfo: 'contact@greenenergy.com'
});

// Register farmer
const farmerTxHash = await helpers.registerFarmer({
  name: 'John Farmer',
  location: '40.7128,-74.0060',
  walletAddress: wallet.getConnectionStatus().address,
  landSize: '100',
  associatedOrg: 1, // Organization ID from previous step
  verificationDocuments: new File(['Verification document content'], 'verification.pdf', { type: 'application/pdf' }),
  description: 'Sustainable farming practices',
  contactInfo: 'john@farmer.com'
});
```

### 3. Submit Verification Request and Mint Carbon Credit

```typescript
// Submit verification request
const verificationTxHash = await helpers.submitVerificationRequest({
  farmerId: 1,
  orgId: 1,
  carbonAmount: '1000', // 1000 tonnes CO2
  location: '40.7128,-74.0060',
  projectType: 0, // Reforestation
  projectDescription: 'Large-scale reforestation project to capture carbon',
  technicalDocuments: new File(['Technical documents'], 'technical.pdf', { type: 'application/pdf' }),
  fieldEvidence: new File(['Field evidence'], 'evidence.pdf', { type: 'application/pdf' }),
  monitoringPlan: new File(['Monitoring plan'], 'monitoring.pdf', { type: 'application/pdf' })
});

// Approve verification request (in real scenario, this would be done by verifiers)
const approvalTxHash = await helpers.approveVerificationRequest(1);

// Get the minted token
const tokenId = await sdk.getTotalSupply();
const metadata = await sdk.getCarbonCreditMetadata(tokenId);
```

### 4. Claim B3TR Rewards

```typescript
// Get user reward info
const rewardInfo = await sdk.getUserRewardInfo(wallet.getConnectionStatus().address);

// Check if user has pending rewards
if (BigInt(rewardInfo.pendingRewards) > 0) {
  const claimTxHash = await helpers.claimRewards({
    userAddress: wallet.getConnectionStatus().address
  });
  console.log('Rewards claimed:', claimTxHash);
}
```

### 5. Bridge Carbon Credit to Another Chain

```typescript
// Get user's tokens
const portfolio = await helpers.getUserPortfolio(wallet.getConnectionStatus().address);

if (portfolio.totalTokens > 0) {
  const tokenId = portfolio.tokens[0].tokenId;
  
  // Bridge token to Ethereum mainnet
  const bridgeTxHash = await helpers.bridgeCarbonCredit(
    tokenId,
    wallet.getConnectionStatus().address, // Recipient on destination chain
    1 // Ethereum mainnet chain ID
  );
  
  // Check bridge status
  const bridgeInfo = await sdk.getBridgeInfo(tokenId);
}
```

## Core Components

### VeChainCarbonCreditSDK

The main SDK class that provides access to all functionality.

```typescript
const sdk = new VeChainCarbonCreditSDK(config, contractAddresses);

// Get network configuration
const networkConfig = sdk.getNetworkConfig();

// Get contract addresses
const addresses = sdk.getContractAddresses();

// Check if features are enabled
const isFeeDelegationEnabled = sdk.isFeeDelegationEnabled();
const isBridgeEnabled = sdk.isBridgeEnabled();

// Get wallet balances
const vetBalance = await sdk.getVETBalance(address);
const vthoBalance = await sdk.getVTHOBalance(address);
```

### Contract Modules

#### CarbonCreditNFTModule

Handles all interactions with the CarbonCreditNFT contract.

```typescript
import { CarbonCreditNFTModule } from './src/sdk';

const nftModule = new CarbonCreditNFTModule(sdk);

// Mint carbon credit
const txHash = await nftModule.mintCarbonCredit({
  to: '0x...',
  carbonAmount: '1000',
  location: '40.7128,-74.0060',
  projectType: 0,
  projectDescription: 'Reforestation project',
  technicalDocumentsHash: 'Qm...',
  fieldEvidenceHash: 'Qm...',
  monitoringPlanHash: 'Qm...',
  tokenURI: 'ipfs://Qm...'
});

// Transfer token
await nftModule.transferFrom(from, to, tokenId);

// Lock token for bridge
await nftModule.lockTokenForBridge({
  tokenId: 1,
  recipient: '0x...',
  destinationChainId: 1,
  bridgeTransactionId: 12345
});
```

#### OrganizationRegistryModule

Manages organization registrations and profiles.

```typescript
import { OrganizationRegistryModule } from './src/sdk';

const orgModule = new OrganizationRegistryModule(sdk);

// Register organization
const txHash = await orgModule.registerOrganization({
  name: 'Green Energy Corp',
  walletAddress: '0x...',
  kycDocumentsHash: 'Qm...'
});

// Get organization profile
const profile = await orgModule.getOrganizationProfile(1);

// Get verified organizations
const verifiedOrgs = await orgModule.getVerifiedOrganizations();
```

#### FarmerRegistryModule

Manages farmer registrations and profiles.

```typescript
import { FarmerRegistryModule } from './src/sdk';

const farmerModule = new FarmerRegistryModule(sdk);

// Register farmer
const txHash = await farmerModule.registerFarmer({
  name: 'John Farmer',
  location: '40.7128,-74.0060',
  walletAddress: '0x...',
  landSize: '100',
  associatedOrg: 1,
  verificationDocumentsHash: 'Qm...'
});

// Get farmer profile
const profile = await farmerModule.getFarmerProfile(1);

// Get farmers by organization
const orgFarmers = await farmerModule.getFarmersByOrganization(1);
```

#### CarbonCreditVerifierModule

Handles verification requests and approval workflow.

```typescript
import { CarbonCreditVerifierModule } from './src/sdk';

const verifierModule = new CarbonCreditVerifierModule(sdk);

// Submit verification request
const txHash = await verifierModule.submitVerificationRequest({
  farmerId: 1,
  orgId: 1,
  carbonAmount: '1000',
  location: '40.7128,-74.0060',
  projectType: 0,
  projectDescription: 'Reforestation project',
  technicalDocumentsHash: 'Qm...',
  fieldEvidenceHash: 'Qm...',
  monitoringPlanHash: 'Qm...'
});

// Assign verifier
await verifierModule.assignVerifier({
  requestId: 1,
  verifierAddress: '0x...',
  deadline: Math.floor(Date.now() / 1000) + 86400 // 24 hours
});

// Approve verification request
await verifierModule.approveVerificationRequest({
  requestId: 1,
  tokenURI: 'ipfs://Qm...'
});
```

#### VeBetterIntegrationModule

Manages B3TR token rewards and distribution.

```typescript
import { VeBetterIntegrationModule } from './src/sdk';

const veBetterModule = new VeBetterIntegrationModule(sdk);

// Claim rewards
const txHash = await veBetterModule.claimRewards({
  userAddress: '0x...'
});

// Get user reward info
const rewardInfo = await veBetterModule.getUserRewardInfo('0x...');

// Calculate potential reward
const potentialReward = await veBetterModule.calculatePotentialReward('1000', true);

// Get reward configuration
const config = await veBetterModule.getRewardConfig();
```

### Helper Functions

#### CarbonCreditHelpers

High-level helper functions for common operations.

```typescript
import { CarbonCreditHelpers } from './src/sdk';

const helpers = new CarbonCreditHelpers(sdk);

// Complete workflow: Register organization, farmer, and mint carbon credit
const result = await helpers.completeCarbonCreditWorkflow({
  organization: {
    name: 'Eco Solutions Inc',
    walletAddress: '0x...',
    kycDocuments: new File(['KYC document content'], 'kyc.pdf', { type: 'application/pdf' }),
    description: 'Environmental solutions company',
    website: 'https://ecosolutions.com',
    contactInfo: 'contact@ecosolutions.com'
  },
  farmer: {
    name: 'Jane Farmer',
    location: '40.7128,-74.0060',
    walletAddress: '0x...',
    landSize: '200',
    associatedOrg: 0, // Will be set automatically
    verificationDocuments: new File(['Verification document content'], 'verification.pdf', { type: 'application/pdf' }),
    description: 'Sustainable agriculture practices',
    contactInfo: 'jane@farmer.com'
  },
  carbonCredit: {
    farmerId: 0, // Will be set automatically
    orgId: 0, // Will be set automatically
    carbonAmount: '2000',
    location: '40.7128,-74.0060',
    projectType: 0,
    projectDescription: 'Comprehensive reforestation and carbon capture project',
    technicalDocuments: new File(['Technical documents'], 'technical.pdf', { type: 'application/pdf' }),
    fieldEvidence: new File(['Field evidence'], 'evidence.pdf', { type: 'application/pdf' }),
    monitoringPlan: new File(['Monitoring plan'], 'monitoring.pdf', { type: 'application/pdf' })
  }
});

// Get user portfolio
const portfolio = await helpers.getUserPortfolio('0x...');

// Get system statistics
const stats = await helpers.getSystemStatistics();
```

### IPFS Utilities

#### IPFSUtils

Handles file uploads to IPFS using Pinata or Web3.Storage.

```typescript
import { IPFSUtils } from './src/sdk';

const ipfsUtils = new IPFSUtils('pinata', {
  pinataApiKey: 'your-pinata-api-key',
  pinataSecretKey: 'your-pinata-secret-key'
});

// Upload file
const hash = await ipfsUtils.uploadFile(new File(['content'], 'file.txt'));

// Upload JSON
const jsonHash = await ipfsUtils.uploadJSON({ name: 'test', value: 123 });

// Upload image
const imageHash = await ipfsUtils.uploadImage(imageFile);

// Upload document
const docHash = await ipfsUtils.uploadDocument(documentFile);

// Get IPFS URL
const url = ipfsUtils.getIPFSUrl(hash);

// Create carbon credit metadata
const metadata = IPFSUtils.createCarbonCreditMetadata({
  name: 'Carbon Credit #1',
  description: 'Verified carbon credit',
  image: 'ipfs://Qm...',
  carbonAmount: '1000',
  location: '40.7128,-74.0060',
  projectType: 'Reforestation',
  verificationStatus: 'Verified',
  generationDate: '2024-01-01',
  proofsIPFSHash: 'Qm...'
});
```

### Wallet Integration

#### VeWorldWallet

Handles wallet connection and transaction signing with VeWorld.

```typescript
import { VeWorldWallet } from './src/sdk';

const wallet = new VeWorldWallet({
  network: 'testnet',
  connex
});

// Connect to wallet
const connectionResult = await wallet.connect();

// Get connection status
const status = wallet.getConnectionStatus();

// Get balances
const vetBalance = await wallet.getVETBalance();
const vthoBalance = await wallet.getVTHOBalance();

// Sign transaction
const txHash = await wallet.signTransaction({
  clauses: [clause],
  gas: 500000,
  gasPrice: '0x0'
});

// Send transaction and wait for confirmation
const result = await wallet.sendTransaction({
  clauses: [clause],
  gas: 500000,
  gasPrice: '0x0'
});

// Sign message
const signature = await wallet.signMessage('Hello VeChain');

// Switch network
await wallet.switchNetwork('mainnet');

// Listen for account changes
wallet.onAccountChange((address) => {
  console.log('Account changed:', address);
});

// Listen for network changes
wallet.onNetworkChange((network) => {
  console.log('Network changed:', network);
});
```

## Configuration

### SDK Configuration

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
```

### Contract Addresses

```typescript
interface ContractAddresses {
  carbonCreditNFT: string;
  organizationRegistry: string;
  farmerRegistry: string;
  carbonCreditVerifier: string;
  feeDelegationManager: string;
  veBetterIntegration: string;
}
```

## Error Handling

The SDK includes comprehensive error handling for all operations:

```typescript
try {
  const txHash = await helpers.registerOrganization(params);
  console.log('Organization registered:', txHash);
} catch (error) {
  if (error.message.includes('Wallet not connected')) {
    console.error('Please connect your wallet first');
  } else if (error.message.includes('Insufficient balance')) {
    console.error('Insufficient VET/VTHO balance');
  } else {
    console.error('Registration failed:', error.message);
  }
}
```

## Best Practices

### 1. Always Check Wallet Connection

```typescript
if (!wallet.getConnectionStatus().isConnected) {
  await wallet.connect();
}
```

### 2. Handle Transaction Confirmations

```typescript
const txHash = await helpers.registerOrganization(params);
console.log('Transaction submitted:', txHash);

// Wait for confirmation
const receipt = await wallet.waitForTransaction(txHash);
console.log('Transaction confirmed:', receipt);
```

### 3. Use Fee Delegation for Better UX

```typescript
const sdk = new VeChainCarbonCreditSDK({
  network: 'testnet',
  connex,
  feeDelegation: true, // Enable fee delegation
  // ... other config
}, contractAddresses);
```

### 4. Implement Proper Error Handling

```typescript
try {
  const result = await helpers.completeCarbonCreditWorkflow(params);
  console.log('Workflow completed:', result);
} catch (error) {
  console.error('Workflow failed:', error);
  // Handle specific error cases
  if (error.message.includes('IPFS upload failed')) {
    // Retry or use fallback
  }
}
```

### 5. Monitor Bridge Status

```typescript
// Subscribe to bridge events
if (sdk.isBridgeEnabled()) {
  const eventManager = sdk.getEventManager();
  eventManager.subscribeToBridgeEvents(
    { transactionId: bridgeTxId },
    (event) => {
      console.log('Bridge event:', event);
      if (event.status === 'completed') {
        console.log('Bridge completed successfully!');
      }
    }
  );
}
```

## Network Configuration

### Testnet

```typescript
const connex = new Connex({
  node: 'https://testnet.veblocks.net',
  network: 'testnet'
});
```

### Mainnet

```typescript
const connex = new Connex({
  node: 'https://mainnet.veblocks.net',
  network: 'mainnet'
});
```

### Solo Network

```typescript
const connex = new Connex({
  node: 'https://solo.veblocks.net',
  network: 'solo'
});
```

## Examples

See the `examples/` directory for complete working examples:

- `basic-usage.ts` - Basic SDK setup and usage
- `register-organization-farmer.ts` - Organization and farmer registration
- `submit-verification-mint.ts` - Verification request and carbon credit minting
- `claim-rewards.ts` - B3TR reward claiming
- `bridge-carbon-credit.ts` - Cross-chain carbon credit bridging
- `complete-workflow.ts` - Complete end-to-end workflow

## Support

For support and questions:

- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [SDK Documentation](https://docs.carbon-credit.vechain.org)
- Community: [VeChain Discord](https://discord.gg/vechain)

## License

MIT License - see LICENSE file for details.
