import { ethers } from 'hardhat';

async function main() {
  console.log('⛽ Testing Fee Delegation System...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract address
  const feeDelegationManagerAddress = '0x9DEa0182aEc767269416aa76fBD8fF2327A5ac80';
  const feeDelegationManager = await ethers.getContractAt('FeeDelegationManager', feeDelegationManagerAddress);
  
  try {
    console.log('📋 Fee Delegation Test:');
    console.log('   Testing sponsor registration and delegation request...');
    
    // Register a sponsor
    console.log('\n⏳ Registering a sponsor...');
    const sponsorData = {
      name: 'VeChain Energy Sponsor',
      walletAddress: deployer.address,
      dailyLimit: ethers.parseEther('1000'), // 1000 VET daily limit
      isActive: true
    };
    
    const registerSponsorTx = await feeDelegationManager.registerSponsor(
      sponsorData.name,
      sponsorData.walletAddress,
      sponsorData.dailyLimit
    );
    
    const registerReceipt = await registerSponsorTx.wait();
    console.log('✅ Sponsor registered successfully!');
    console.log(`   Transaction Hash: ${registerReceipt?.hash}`);
    
    // Set sponsor as active
    console.log('\n⏳ Activating sponsor...');
    const activateTx = await feeDelegationManager.setSponsorStatus(
      deployer.address,
      true
    );
    
    const activateReceipt = await activateTx.wait();
    console.log('✅ Sponsor activated successfully!');
    console.log(`   Transaction Hash: ${activateReceipt?.hash}`);
    
    // Whitelist a user
    console.log('\n⏳ Whitelisting user for fee delegation...');
    const whitelistTx = await feeDelegationManager.setUserWhitelist(
      deployer.address,
      true
    );
    
    const whitelistReceipt = await whitelistTx.wait();
    console.log('✅ User whitelisted successfully!');
    console.log(`   Transaction Hash: ${whitelistReceipt?.hash}`);
    
    // Request delegation
    console.log('\n⏳ Requesting fee delegation...');
    const requestTx = await feeDelegationManager.requestDelegation(
      deployer.address,
      ethers.parseEther('0.1') // Request 0.1 VET worth of gas
    );
    
    const requestReceipt = await requestTx.wait();
    console.log('✅ Fee delegation requested successfully!');
    console.log(`   Transaction Hash: ${requestReceipt?.hash}`);
    
    console.log('\n🎉 Fee Delegation Test Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📄 Test Results:');
    console.log('   ✅ Sponsor Registration: SUCCESS');
    console.log('   ✅ Sponsor Activation: SUCCESS');
    console.log('   ✅ User Whitelisting: SUCCESS');
    console.log('   ✅ Delegation Request: SUCCESS');
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   Sponsor Registration: https://explore-testnet.vechain.org/transactions/${registerReceipt?.hash}`);
    console.log(`   Delegation Request: https://explore-testnet.vechain.org/transactions/${requestReceipt?.hash}`);
    
    console.log('\n💡 Fee Delegation System Working!');
    console.log('   Users can now request gas sponsorship for transactions.');
    console.log('   This enables gasless transactions for carbon credit operations.');
    
  } catch (error) {
    console.error('❌ Failed to test fee delegation:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });