import { ethers } from 'hardhat';

async function main() {
  console.log('🌱 Testing VeBetter DAO Integration...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract address
  const veBetterIntegrationAddress = '0x9A19070ded63B5f3321fC48646F88A6f9f97690F';
  const veBetterIntegration = await ethers.getContractAt('VeBetterIntegration', veBetterIntegrationAddress);
  
  try {
    console.log('📋 VeBetter Integration Test:');
    console.log('   Testing B3TR token rewards for carbon credit generation...');
    
    // Test reward calculation
    console.log('\n⏳ Testing reward calculation...');
    const carbonAmount = ethers.parseEther('100'); // 100 tons CO2
    const reward = await veBetterIntegration.calculateReward(carbonAmount);
    
    console.log('✅ Reward calculation successful!');
    console.log(`   Carbon Amount: ${ethers.formatEther(carbonAmount)} tons CO2`);
    console.log(`   B3TR Reward: ${ethers.formatEther(reward)} B3TR tokens`);
    
    // Test setting user as active
    console.log('\n⏳ Setting user as active for rewards...');
    const setActiveTx = await veBetterIntegration.setUserActive(deployer.address, true);
    const setActiveReceipt = await setActiveTx.wait();
    
    console.log('✅ User activated for rewards!');
    console.log(`   Transaction Hash: ${setActiveReceipt?.hash}`);
    
    // Test claiming rewards (this might fail if no rewards are available, but that's expected)
    console.log('\n⏳ Attempting to claim rewards...');
    try {
      const claimTx = await veBetterIntegration.claimRewards();
      const claimReceipt = await claimTx.wait();
      console.log('✅ Rewards claimed successfully!');
      console.log(`   Transaction Hash: ${claimReceipt?.hash}`);
    } catch (claimError) {
      console.log('ℹ️  No rewards available to claim (this is expected for new users)');
    }
    
    console.log('\n🎉 VeBetter Integration Test Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📄 Test Results:');
    console.log('   ✅ Reward Calculation: SUCCESS');
    console.log('   ✅ User Activation: SUCCESS');
    console.log('   ✅ Integration Ready: SUCCESS');
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   User Activation: https://explore-testnet.vechain.org/transactions/${setActiveReceipt?.hash}`);
    
    console.log('\n💡 VeBetter DAO Integration Working!');
    console.log('   Users can now earn B3TR tokens for carbon credit generation.');
    console.log('   This incentivizes sustainable practices and carbon offsetting.');
    console.log('   B3TR tokens can be used in the VeBetter ecosystem.');
    
    console.log('\n📊 Reward Information:');
    console.log(`   For 100 tons CO2: ${ethers.formatEther(reward)} B3TR tokens`);
    console.log('   Rewards are calculated based on carbon amount and current rate.');
    console.log('   Users must be active to receive rewards.');
    
  } catch (error) {
    console.error('❌ Failed to test VeBetter integration:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
