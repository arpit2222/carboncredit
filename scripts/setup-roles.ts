import { ethers } from 'hardhat';

async function main() {
  console.log('🔗 Setting up roles for deployed contracts...');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract addresses from the previous successful deployment
  const carbonCreditNFTAddress = '0x6B3340C8dCc214Bb4854B6685F09018c689eC798';
  
  // Get the contract instance
  const carbonCreditNFT = await ethers.getContractAt('CarbonCreditNFT', carbonCreditNFTAddress);
  
  // Role constants
  const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
  const BRIDGE_ROLE = '0x52ba824bfabc2bcfcdf7f0edbb486ebb05e1836c90e78047efeb949990f72e5f';
  const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const BURNER_ROLE = '0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848';
  
  try {
    // Grant MINTER_ROLE to deployer for direct minting
    console.log('⏳ Granting MINTER_ROLE to deployer...');
    await carbonCreditNFT.grantRole(MINTER_ROLE, deployer.address);
    console.log('✅ Granted MINTER_ROLE to deployer');

    // Grant BRIDGE_ROLE to deployer for bridge operations
    console.log('⏳ Granting BRIDGE_ROLE to deployer...');
    await carbonCreditNFT.grantRole(BRIDGE_ROLE, deployer.address);
    console.log('✅ Granted BRIDGE_ROLE to deployer');

    // Verify roles for CarbonCreditNFT
    console.log('\n🔐 Verifying CarbonCreditNFT role assignments...');
    const hasAdminRole = await carbonCreditNFT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
    const hasMinterRole = await carbonCreditNFT.hasRole(MINTER_ROLE, deployer.address);
    const hasBurnerRole = await carbonCreditNFT.hasRole(BURNER_ROLE, deployer.address);
    const hasBridgeRole = await carbonCreditNFT.hasRole(BRIDGE_ROLE, deployer.address);
    
    console.log(`   Admin Role: ${hasAdminRole ? '✅' : '❌'}`);
    console.log(`   Minter Role: ${hasMinterRole ? '✅' : '❌'}`);
    console.log(`   Burner Role: ${hasBurnerRole ? '✅' : '❌'}`);
    console.log(`   Bridge Role: ${hasBridgeRole ? '✅' : '❌'}`);

    console.log('\n🎉 Role setup completed successfully!');
    
    // Display deployment summary
    console.log('\n📋 DEPLOYMENT SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log('🌐 Network: VeChain Testnet');
    console.log('👤 Deployer:', deployer.address);
    console.log('═══════════════════════════════════════');
    console.log('📄 Deployed Contracts:');
    console.log('   OrganizationRegistry: 0x32893e2376ce2f5AfE90552ea4Accf091a0004Dd');
    console.log('   FarmerRegistry:       0x60AB51e35993143f5931A218157B074c6Aca9047');
    console.log('   CarbonCreditNFT:      0x6B3340C8dCc214Bb4854B6685F09018c689eC798');
    console.log('   FeeDelegationManager: 0x9DEa0182aEc767269416aa76fBD8fF2327A5ac80');
    console.log('   VeBetterIntegration:  0x9A19070ded63B5f3321fC48646F88A6f9f97690F');
    console.log('═══════════════════════════════════════');
    console.log('🔗 Explorer: https://explore-testnet.vechain.org');
    console.log('═══════════════════════════════════════');
    
  } catch (error) {
    console.error('❌ Role setup failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
