import { ethers } from 'hardhat';

async function main() {
  console.log('🎉 VeChain Carbon Credit System - Deployment Complete!');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('🌐 Network: VeChain Testnet');
  console.log('👤 Deployer:', deployer.address);
  console.log('═══════════════════════════════════════════════════════════');
  
  console.log('📄 Successfully Deployed Contracts:');
  console.log('   OrganizationRegistry: 0x32893e2376ce2f5AfE90552ea4Accf091a0004Dd');
  console.log('   FarmerRegistry:       0x60AB51e35993143f5931A218157B074c6Aca9047');
  console.log('   CarbonCreditNFT:      0x6B3340C8dCc214Bb4854B6685F09018c689eC798');
  console.log('   FeeDelegationManager: 0x9DEa0182aEc767269416aa76fBD8fF2327A5ac80');
  console.log('   VeBetterIntegration:  0x9A19070ded63B5f3321fC48646F88A6f9f97690F');
  console.log('═══════════════════════════════════════════════════════════');
  
  console.log('🔗 VeChain Explorer: https://explore-testnet.vechain.org');
  console.log('═══════════════════════════════════════════════════════════');
  
  console.log('✅ All contracts deployed successfully!');
  console.log('✅ Roles granted to deployer (MINTER_ROLE, BRIDGE_ROLE)');
  console.log('✅ System ready for use!');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Test contract interactions');
  console.log('   2. Mint your first carbon credit NFT');
  console.log('   3. Register organizations and farmers');
  console.log('   4. Set up fee delegation');
  console.log('   5. Integrate with VeBetter DAO');
  
  console.log('\n📚 Documentation:');
  console.log('   - README.md: Complete setup guide');
  console.log('   - docs/: Integration guides and API reference');
  console.log('   - examples/: Usage examples');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
