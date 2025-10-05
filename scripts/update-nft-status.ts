import { ethers } from 'hardhat';

async function main() {
  console.log('✅ Updating NFT Verification Status...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract address
  const carbonCreditNFTAddress = '0x6B3340C8dCc214Bb4854B6685F09018c689eC798';
  const carbonCreditNFT = await ethers.getContractAt('CarbonCreditNFT', carbonCreditNFTAddress);
  
  const tokenId = 1; // The NFT we minted earlier
  
  try {
    console.log('📋 NFT Details:');
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Current Status: Pending`);
    console.log(`   New Status: Verified`);
    
    console.log('\n⏳ Updating verification status to Verified...');
    const updateTx = await carbonCreditNFT.updateVerificationStatus(
      tokenId,
      1 // VerificationStatus.Verified = 1
    );
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await updateTx.wait();
    
    console.log('✅ NFT verification status updated successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📄 Transaction Details:');
    console.log(`   Transaction Hash: ${receipt?.hash}`);
    console.log(`   Gas Used: ${receipt?.gasUsed?.toString()}`);
    console.log(`   Block Number: ${receipt?.blockNumber}`);
    
    console.log('\n🎨 Updated NFT Details:');
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Owner: ${deployer.address}`);
    console.log(`   Status: Verified ✅`);
    console.log(`   Carbon Amount: 100 tons CO2`);
    console.log(`   Location: Amazon Rainforest, Brazil`);
    console.log(`   Project Type: Reforestation`);
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   https://explore-testnet.vechain.org/transactions/${receipt?.hash}`);
    
    console.log('\n🎉 NFT verification complete!');
    console.log('   Your carbon credit NFT is now verified and ready for trading or retirement.');
    console.log('   Verified NFTs have higher value and can be used for carbon offsetting.');
    
  } catch (error) {
    console.error('❌ Failed to update NFT status:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
