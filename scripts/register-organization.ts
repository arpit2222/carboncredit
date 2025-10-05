import { ethers } from 'hardhat';

async function main() {
  console.log('🏢 Registering an Organization...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract address
  const organizationRegistryAddress = '0x32893e2376ce2f5AfE90552ea4Accf091a0004Dd';
  const organizationRegistry = await ethers.getContractAt('OrganizationRegistry', organizationRegistryAddress);
  
  // Sample organization data
  const organizationData = {
    name: 'Green Earth Foundation',
    walletAddress: deployer.address,
    kycDocumentsHash: 'QmGreenEarthKYCDocuments123456789',
    description: 'A leading environmental organization focused on reforestation and carbon offset projects'
  };
  
  try {
    console.log('📋 Organization Details:');
    console.log(`   Name: ${organizationData.name}`);
    console.log(`   Wallet Address: ${organizationData.walletAddress}`);
    console.log(`   KYC Documents Hash: ${organizationData.kycDocumentsHash}`);
    console.log(`   Description: ${organizationData.description}`);
    
    console.log('\n⏳ Registering organization...');
    const registerTx = await organizationRegistry.registerOrganization(
      organizationData.name,
      organizationData.walletAddress,
      organizationData.kycDocumentsHash
    );
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await registerTx.wait();
    
    console.log('✅ Organization registered successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📄 Transaction Details:');
    console.log(`   Transaction Hash: ${receipt?.hash}`);
    console.log(`   Gas Used: ${receipt?.gasUsed?.toString()}`);
    console.log(`   Block Number: ${receipt?.blockNumber}`);
    
    // Get organization ID (should be 1 for the first registration)
    const orgId = 1;
    
    console.log('\n🏢 Organization Details:');
    console.log(`   Organization ID: ${orgId}`);
    console.log(`   Name: ${organizationData.name}`);
    console.log(`   Wallet Address: ${organizationData.walletAddress}`);
    console.log(`   Status: Pending Verification`);
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   https://explore-testnet.vechain.org/transactions/${receipt?.hash}`);
    
    console.log('\n🎉 Organization registration complete!');
    console.log('   The organization is now registered and can be verified by an admin.');
    
  } catch (error) {
    console.error('❌ Failed to register organization:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
