import { ethers } from 'hardhat';

async function main() {
  console.log('🌱 Minting your first Carbon Credit NFT...');
  console.log('═══════════════════════════════════════════════════════════');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer address:', deployer.address);
  
  // Use the deployed contract address
  const carbonCreditNFTAddress = '0x6B3340C8dCc214Bb4854B6685F09018c689eC798';
  const carbonCreditNFT = await ethers.getContractAt('CarbonCreditNFT', carbonCreditNFTAddress);
  
  // Sample carbon credit data
  const carbonCreditData = {
    carbonAmount: ethers.parseEther('100'), // 100 tons of CO2
    location: 'Amazon Rainforest, Brazil',
    projectType: 0, // Reforestation
    proofsIPFSHash: 'QmSampleCarbonCreditProofs123456789',
    tokenURI: 'QmSampleCarbonCreditMetadata123456789'
  };
  
  try {
    console.log('📋 Carbon Credit Details:');
    console.log(`   Amount: ${ethers.formatEther(carbonCreditData.carbonAmount)} tons CO2`);
    console.log(`   Location: ${carbonCreditData.location}`);
    console.log(`   Project Type: Reforestation`);
    console.log(`   Proofs IPFS Hash: ${carbonCreditData.proofsIPFSHash}`);
    console.log(`   Token URI: ${carbonCreditData.tokenURI}`);
    
    console.log('\n⏳ Minting NFT...');
    const mintTx = await carbonCreditNFT.mintCarbonCredit(
      deployer.address, // to
      carbonCreditData.carbonAmount,
      carbonCreditData.location,
      carbonCreditData.projectType,
      carbonCreditData.proofsIPFSHash,
      carbonCreditData.tokenURI
    );
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await mintTx.wait();
    
    console.log('✅ Carbon Credit NFT minted successfully!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📄 Transaction Details:');
    console.log(`   Transaction Hash: ${receipt?.hash}`);
    console.log(`   Gas Used: ${receipt?.gasUsed?.toString()}`);
    console.log(`   Block Number: ${receipt?.blockNumber}`);
    
    // Get the token ID from the transaction logs or use 1 as the first mint
    const tokenId = 1;
    
    console.log('\n🎨 NFT Details:');
    console.log(`   Token ID: ${tokenId}`);
    console.log(`   Owner: ${deployer.address}`);
    console.log(`   Token URI: ipfs://${carbonCreditData.tokenURI}`);
    
    // Get NFT metadata
    const metadata = await carbonCreditNFT.getCarbonCreditMetadata(tokenId);
    console.log('\n📊 Carbon Credit Metadata:');
    console.log(`   Credit ID: ${metadata.creditId}`);
    console.log(`   Carbon Amount: ${ethers.formatEther(metadata.carbonAmount)} tons CO2`);
    console.log(`   Generator Address: ${metadata.generatorAddress}`);
    console.log(`   Location: ${metadata.location}`);
    console.log(`   Project Type: ${metadata.projectType}`);
    console.log(`   Verification Status: ${metadata.verificationStatus}`);
    console.log(`   Generation Date: ${new Date(Number(metadata.generationDate) * 1000).toISOString()}`);
    console.log(`   Proofs IPFS Hash: ${metadata.proofsIPFSHash}`);
    
    console.log('\n🔗 View on VeChain Explorer:');
    console.log(`   https://explore-testnet.vechain.org/transactions/${receipt?.hash}`);
    
    console.log('\n🎉 Congratulations! You have successfully minted your first Carbon Credit NFT!');
    console.log('   This NFT represents 100 tons of CO2 sequestered through reforestation.');
    console.log('   It can be traded, retired, or used for carbon offsetting purposes.');
    
  } catch (error) {
    console.error('❌ Failed to mint NFT:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
