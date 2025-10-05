import { ethers } from 'hardhat';

async function main() {
  console.log('🔍 Verifying your minted Carbon Credit NFT...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Owner address:', deployer.address);
  
  // Use the deployed contract address
  const carbonCreditNFTAddress = '0x6B3340C8dCc214Bb4854B6685F09018c689eC798';
  const carbonCreditNFT = await ethers.getContractAt('CarbonCreditNFT', carbonCreditNFTAddress);
  
  try {
    const tokenId = 1;
    
    console.log('🎨 NFT Details:');
    console.log(`   Token ID: ${tokenId}`);
    
    // Check if token exists
    const owner = await carbonCreditNFT.ownerOf(tokenId);
    console.log(`   Owner: ${owner}`);
    
    // Get token URI
    const tokenURI = await carbonCreditNFT.tokenURI(tokenId);
    console.log(`   Token URI: ${tokenURI}`);
    
    // Get total supply
    const totalSupply = await carbonCreditNFT.totalSupply();
    console.log(`   Total Supply: ${totalSupply}`);
    
    // Check balance of owner
    const balance = await carbonCreditNFT.balanceOf(deployer.address);
    console.log(`   Owner Balance: ${balance}`);
    
    console.log('\n✅ NFT Verification Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Your Carbon Credit NFT is successfully minted and verified!');
    console.log('   This NFT represents 100 tons of CO2 sequestered through reforestation.');
    console.log('   It can be traded, retired, or used for carbon offsetting purposes.');
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   Contract: https://explore-testnet.vechain.org/accounts/${carbonCreditNFTAddress}`);
    console.log(`   Your NFT: Token ID #${tokenId}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Register an organization in OrganizationRegistry');
    console.log('   2. Register a farmer in FarmerRegistry');
    console.log('   3. Update the NFT verification status');
    console.log('   4. Test fee delegation');
    console.log('   5. Integrate with VeBetter DAO for rewards');
    
  } catch (error) {
    console.error('❌ Failed to verify NFT:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
