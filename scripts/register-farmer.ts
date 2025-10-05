import { ethers } from 'hardhat';

async function main() {
  console.log('🌾 Registering a Farmer...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract address
  const farmerRegistryAddress = '0x60AB51e35993143f5931A218157B074c6Aca9047';
  const farmerRegistry = await ethers.getContractAt('FarmerRegistry', farmerRegistryAddress);
  
  // Sample farmer data
  const farmerData = {
    name: 'Carlos Silva',
    location: 'Rondônia, Brazil',
    walletAddress: deployer.address,
    landSize: ethers.parseEther('50'), // 50 hectares
    associatedOrg: 1, // Associated with the organization we just registered
    verificationDocumentsHash: 'QmCarlosSilvaVerificationDocs123456789'
  };
  
  try {
    console.log('📋 Farmer Details:');
    console.log(`   Name: ${farmerData.name}`);
    console.log(`   Location: ${farmerData.location}`);
    console.log(`   Wallet Address: ${farmerData.walletAddress}`);
    console.log(`   Land Size: ${ethers.formatEther(farmerData.landSize)} hectares`);
    console.log(`   Associated Organization ID: ${farmerData.associatedOrg}`);
    console.log(`   Verification Documents Hash: ${farmerData.verificationDocumentsHash}`);
    
    console.log('\n⏳ Registering farmer...');
    const registerTx = await farmerRegistry.registerFarmer(
      farmerData.name,
      farmerData.location,
      farmerData.walletAddress,
      farmerData.landSize,
      farmerData.associatedOrg,
      farmerData.verificationDocumentsHash
    );
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await registerTx.wait();
    
    console.log('✅ Farmer registered successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📄 Transaction Details:');
    console.log(`   Transaction Hash: ${receipt?.hash}`);
    console.log(`   Gas Used: ${receipt?.gasUsed?.toString()}`);
    console.log(`   Block Number: ${receipt?.blockNumber}`);
    
    // Get farmer ID (should be 1 for the first registration)
    const farmerId = 1;
    
    console.log('\n🌾 Farmer Details:');
    console.log(`   Farmer ID: ${farmerId}`);
    console.log(`   Name: ${farmerData.name}`);
    console.log(`   Location: ${farmerData.location}`);
    console.log(`   Land Size: ${ethers.formatEther(farmerData.landSize)} hectares`);
    console.log(`   Associated Organization: ${farmerData.associatedOrg}`);
    console.log(`   Status: Pending Verification`);
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   https://explore-testnet.vechain.org/transactions/${receipt?.hash}`);
    
    console.log('\n🎉 Farmer registration complete!');
    console.log('   The farmer is now registered and can be verified by an admin.');
    console.log('   They are associated with the Green Earth Foundation organization.');
    
  } catch (error) {
    console.error('❌ Failed to register farmer:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
