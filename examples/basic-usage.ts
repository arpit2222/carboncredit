/**
 * Basic Usage Example
 * Demonstrates how to use the VeChain Carbon Credit SDK
 */

import { 
  VeChainCarbonCreditSDK, 
  VeWorldWallet, 
  CarbonCreditHelpers,
  IPFSUtils 
} from '../src/sdk';
import { Connex } from '@vechain/connex';

// Example: Basic SDK setup and usage
async function basicUsageExample() {
  console.log('🌱 VeChain Carbon Credit SDK - Basic Usage Example');

  // Step 1: Initialize Connex
  const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'testnet'
  });

  // Step 2: Initialize VeWorld wallet
  const wallet = new VeWorldWallet({
    network: 'testnet',
    connex
  });

  // Step 3: Connect to wallet
  console.log('🔗 Connecting to VeWorld wallet...');
  const connectionResult = await wallet.connect();
  console.log('✅ Connected to wallet:', connectionResult.address);

  // Step 4: Configure SDK
  const contractAddresses = {
    carbonCreditNFT: '0x...', // Replace with actual contract address
    organizationRegistry: '0x...',
    farmerRegistry: '0x...',
    carbonCreditVerifier: '0x...',
    feeDelegationManager: '0x...',
    veBetterIntegration: '0x...'
  };

  const sdkConfig = {
    network: 'testnet' as const,
    connex,
    wallet: undefined, // Will be set after wallet connection
    feeDelegation: true,
    bridgeEnabled: true,
    ipfsProvider: 'pinata' as const,
    ipfsConfig: {
      pinataApiKey: 'your-pinata-api-key',
      pinataSecretKey: 'your-pinata-secret-key'
    }
  };

  const sdk = new VeChainCarbonCreditSDK(sdkConfig, contractAddresses);

  // Step 5: Initialize helpers
  const helpers = new CarbonCreditHelpers(sdk);

  // Step 6: Get wallet balances
  console.log('💰 Getting wallet balances...');
  const vetBalance = await sdk.getVETBalance(connectionResult.address);
  const vthoBalance = await sdk.getVTHOBalance(connectionResult.address);
  console.log(`VET Balance: ${vetBalance}`);
  console.log(`VTHO Balance: ${vthoBalance}`);

  // Step 7: Get system statistics
  console.log('📊 Getting system statistics...');
  const stats = await helpers.getSystemStatistics();
  console.log('System Statistics:', stats);

  // Step 8: Get user portfolio
  console.log('📋 Getting user portfolio...');
  const portfolio = await helpers.getUserPortfolio(connectionResult.address);
  console.log('User Portfolio:', portfolio);

  console.log('✅ Basic usage example completed!');
}

// Example: Register organization and farmer
async function registerOrganizationAndFarmerExample() {
  console.log('🏢 Register Organization and Farmer Example');

  // Initialize SDK (same as above)
  const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'testnet'
  });

  const wallet = new VeWorldWallet({
    network: 'testnet',
    connex
  });

  await wallet.connect();

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

  const helpers = new CarbonCreditHelpers(sdk);

  // Register organization
  console.log('📝 Registering organization...');
  const orgTxHash = await helpers.registerOrganization({
    name: 'Green Energy Corp',
    walletAddress: wallet.getConnectionStatus().address,
    kycDocuments: new File(['KYC document content'], 'kyc.pdf', { type: 'application/pdf' }),
    description: 'Leading renewable energy company',
    website: 'https://greenenergy.com',
    contactInfo: 'contact@greenenergy.com'
  });
  console.log('✅ Organization registered:', orgTxHash);

  // Register farmer
  console.log('👨‍🌾 Registering farmer...');
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
  console.log('✅ Farmer registered:', farmerTxHash);

  console.log('✅ Registration example completed!');
}

// Example: Submit verification request and mint carbon credit
async function submitVerificationAndMintExample() {
  console.log('🔍 Submit Verification and Mint Example');

  // Initialize SDK (same as above)
  const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'testnet'
  });

  const wallet = new VeWorldWallet({
    network: 'testnet',
    connex
  });

  await wallet.connect();

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

  const helpers = new CarbonCreditHelpers(sdk);

  // Submit verification request
  console.log('📋 Submitting verification request...');
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
  console.log('✅ Verification request submitted:', verificationTxHash);

  // Approve verification request (in real scenario, this would be done by verifiers)
  console.log('✅ Approving verification request...');
  const approvalTxHash = await helpers.approveVerificationRequest(1);
  console.log('✅ Verification request approved:', approvalTxHash);

  // Get the minted token
  const tokenId = await sdk.getTotalSupply();
  console.log('🎉 Carbon credit NFT minted with token ID:', tokenId);

  // Get token metadata
  const metadata = await sdk.getCarbonCreditMetadata(tokenId);
  console.log('📄 Token metadata:', metadata);

  console.log('✅ Verification and minting example completed!');
}

// Example: Claim B3TR rewards
async function claimRewardsExample() {
  console.log('💰 Claim B3TR Rewards Example');

  // Initialize SDK (same as above)
  const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'testnet'
  });

  const wallet = new VeWorldWallet({
    network: 'testnet',
    connex
  });

  await wallet.connect();

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

  const helpers = new CarbonCreditHelpers(sdk);

  // Get user reward info
  console.log('📊 Getting user reward information...');
  const rewardInfo = await sdk.getUserRewardInfo(wallet.getConnectionStatus().address);
  console.log('Reward Info:', rewardInfo);

  // Check if user has pending rewards
  if (BigInt(rewardInfo.pendingRewards) > 0) {
    console.log('💰 Claiming B3TR rewards...');
    const claimTxHash = await helpers.claimRewards({
      userAddress: wallet.getConnectionStatus().address
    });
    console.log('✅ Rewards claimed:', claimTxHash);
  } else {
    console.log('ℹ️ No pending rewards to claim');
  }

  console.log('✅ Rewards example completed!');
}

// Example: Bridge carbon credit to another chain
async function bridgeCarbonCreditExample() {
  console.log('🌉 Bridge Carbon Credit Example');

  // Initialize SDK (same as above)
  const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'testnet'
  });

  const wallet = new VeWorldWallet({
    network: 'testnet',
    connex
  });

  await wallet.connect();

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

  const helpers = new CarbonCreditHelpers(sdk);

  // Get user's tokens
  const portfolio = await helpers.getUserPortfolio(wallet.getConnectionStatus().address);
  
  if (portfolio.totalTokens > 0) {
    const tokenId = portfolio.tokens[0].tokenId;
    
    // Bridge token to Ethereum mainnet
    console.log('🌉 Bridging carbon credit to Ethereum...');
    const bridgeTxHash = await helpers.bridgeCarbonCredit(
      tokenId,
      wallet.getConnectionStatus().address, // Recipient on destination chain
      1 // Ethereum mainnet chain ID
    );
    console.log('✅ Carbon credit locked for bridge:', bridgeTxHash);

    // Check bridge status
    const bridgeInfo = await sdk.getBridgeInfo(tokenId);
    console.log('🌉 Bridge info:', bridgeInfo);
  } else {
    console.log('ℹ️ No tokens to bridge');
  }

  console.log('✅ Bridge example completed!');
}

// Example: Complete workflow
async function completeWorkflowExample() {
  console.log('🔄 Complete Workflow Example');

  // Initialize SDK (same as above)
  const connex = new Connex({
    node: 'https://testnet.veblocks.net',
    network: 'testnet'
  });

  const wallet = new VeWorldWallet({
    network: 'testnet',
    connex
  });

  await wallet.connect();

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

  const helpers = new CarbonCreditHelpers(sdk);

  // Complete workflow: Register organization, farmer, and mint carbon credit
  console.log('🔄 Starting complete workflow...');
  const result = await helpers.completeCarbonCreditWorkflow({
    organization: {
      name: 'Eco Solutions Inc',
      walletAddress: wallet.getConnectionStatus().address,
      kycDocuments: new File(['KYC document content'], 'kyc.pdf', { type: 'application/pdf' }),
      description: 'Environmental solutions company',
      website: 'https://ecosolutions.com',
      contactInfo: 'contact@ecosolutions.com'
    },
    farmer: {
      name: 'Jane Farmer',
      location: '40.7128,-74.0060',
      walletAddress: wallet.getConnectionStatus().address,
      landSize: '200',
      associatedOrg: 0, // Will be set automatically
      verificationDocuments: new File(['Verification document content'], 'verification.pdf', { type: 'application/pdf' }),
      description: 'Sustainable agriculture practices',
      contactInfo: 'jane@farmer.com'
    },
    carbonCredit: {
      farmerId: 0, // Will be set automatically
      orgId: 0, // Will be set automatically
      carbonAmount: '2000', // 2000 tonnes CO2
      location: '40.7128,-74.0060',
      projectType: 0, // Reforestation
      projectDescription: 'Comprehensive reforestation and carbon capture project',
      technicalDocuments: new File(['Technical documents'], 'technical.pdf', { type: 'application/pdf' }),
      fieldEvidence: new File(['Field evidence'], 'evidence.pdf', { type: 'application/pdf' }),
      monitoringPlan: new File(['Monitoring plan'], 'monitoring.pdf', { type: 'application/pdf' }),
      tokenMetadata: {
        name: 'Eco Solutions Carbon Credit #1',
        description: 'Verified carbon credit from reforestation project',
        image: 'ipfs://QmImageHash',
        attributes: [
          { trait_type: 'Project Type', value: 'Reforestation' },
          { trait_type: 'Carbon Amount', value: '2000' },
          { trait_type: 'Location', value: 'New York, USA' }
        ]
      }
    }
  });

  console.log('🎉 Complete workflow completed successfully!');
  console.log('📊 Results:', result);

  // Get final portfolio
  const portfolio = await helpers.getUserPortfolio(wallet.getConnectionStatus().address);
  console.log('📋 Final portfolio:', portfolio);

  console.log('✅ Complete workflow example completed!');
}

// Run examples
async function runExamples() {
  try {
    await basicUsageExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await registerOrganizationAndFarmerExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await submitVerificationAndMintExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await claimRewardsExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await bridgeCarbonCreditExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await completeWorkflowExample();
    
    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Export examples for use
export {
  basicUsageExample,
  registerOrganizationAndFarmerExample,
  submitVerificationAndMintExample,
  claimRewardsExample,
  bridgeCarbonCreditExample,
  completeWorkflowExample,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
