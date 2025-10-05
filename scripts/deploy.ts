import { ethers, network } from 'hardhat';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🚀 Starting VeChain Carbon Credit System deployment...');
  console.log(`📡 Network: ${network.name}`);

  // Get deployer signer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer address: ${deployer.address}`);
  
  // Get deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${ethers.formatEther(balance)} VET`);

  const deploymentInfo: any = {
    network: network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  // Deploy OrganizationRegistry
  console.log('\n⏳ Deploying OrganizationRegistry contract...');
  const OrganizationRegistry = await ethers.getContractFactory('OrganizationRegistry');
  const organizationRegistry = await OrganizationRegistry.deploy();
  await organizationRegistry.waitForDeployment();
  const orgRegistryAddress = await organizationRegistry.getAddress();
  
  console.log('✅ OrganizationRegistry deployed successfully!');
  console.log(`📍 OrganizationRegistry address: ${orgRegistryAddress}`);

  const orgDeploymentTx = organizationRegistry.deploymentTransaction();
  if (orgDeploymentTx) {
    console.log(`🔗 Transaction hash: ${orgDeploymentTx.hash}`);
    const receipt = await orgDeploymentTx.wait();
    console.log(`⛽ Gas used: ${receipt?.gasUsed.toString()}`);
  }

  deploymentInfo.contracts.OrganizationRegistry = {
    address: orgRegistryAddress,
    transactionHash: orgDeploymentTx?.hash,
    gasUsed: orgDeploymentTx ? (await orgDeploymentTx.wait())?.gasUsed.toString() : undefined
  };

  // Deploy FarmerRegistry
  console.log('\n⏳ Deploying FarmerRegistry contract...');
  const FarmerRegistry = await ethers.getContractFactory('FarmerRegistry');
  const farmerRegistry = await FarmerRegistry.deploy();
  await farmerRegistry.waitForDeployment();
  const farmerRegistryAddress = await farmerRegistry.getAddress();
  
  console.log('✅ FarmerRegistry deployed successfully!');
  console.log(`📍 FarmerRegistry address: ${farmerRegistryAddress}`);

  const farmerDeploymentTx = farmerRegistry.deploymentTransaction();
  if (farmerDeploymentTx) {
    console.log(`🔗 Transaction hash: ${farmerDeploymentTx.hash}`);
    const receipt = await farmerDeploymentTx.wait();
    console.log(`⛽ Gas used: ${receipt?.gasUsed.toString()}`);
  }

  deploymentInfo.contracts.FarmerRegistry = {
    address: farmerRegistryAddress,
    transactionHash: farmerDeploymentTx?.hash,
    gasUsed: farmerDeploymentTx ? (await farmerDeploymentTx.wait())?.gasUsed.toString() : undefined
  };

  // Deploy CarbonCreditNFT
  console.log('\n⏳ Deploying CarbonCreditNFT contract...');
  const name = 'VeChain Carbon Credit';
  const symbol = 'VCC';
  const baseTokenURI = 'ipfs://';

  console.log('\n📋 CarbonCreditNFT Parameters:');
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Base URI: ${baseTokenURI}`);

  const CarbonCreditNFT = await ethers.getContractFactory('CarbonCreditNFT');
  const carbonCreditNFT = await CarbonCreditNFT.deploy(name, symbol, baseTokenURI);
  await carbonCreditNFT.waitForDeployment();
  const nftAddress = await carbonCreditNFT.getAddress();
  
  console.log('✅ CarbonCreditNFT deployed successfully!');
  console.log(`📍 CarbonCreditNFT address: ${nftAddress}`);

  const nftDeploymentTx = carbonCreditNFT.deploymentTransaction();
  if (nftDeploymentTx) {
    console.log(`🔗 Transaction hash: ${nftDeploymentTx.hash}`);
    const receipt = await nftDeploymentTx.wait();
    console.log(`⛽ Gas used: ${receipt?.gasUsed.toString()}`);
  }

  deploymentInfo.contracts.CarbonCreditNFT = {
    address: nftAddress,
    name,
    symbol,
    baseTokenURI,
    transactionHash: nftDeploymentTx?.hash,
    gasUsed: nftDeploymentTx ? (await nftDeploymentTx.wait())?.gasUsed.toString() : undefined
  };

  // Deploy FeeDelegationManager
  console.log('\n⏳ Deploying FeeDelegationManager contract...');
  const FeeDelegationManager = await ethers.getContractFactory('FeeDelegationManager');
  const feeDelegationManager = await FeeDelegationManager.deploy();
  await feeDelegationManager.waitForDeployment();
  const feeDelegationAddress = await feeDelegationManager.getAddress();
  
  console.log('✅ FeeDelegationManager deployed successfully!');
  console.log(`📍 FeeDelegationManager address: ${feeDelegationAddress}`);

  const feeDelegationTx = feeDelegationManager.deploymentTransaction();
  if (feeDelegationTx) {
    console.log(`🔗 Transaction hash: ${feeDelegationTx.hash}`);
    const receipt = await feeDelegationTx.wait();
    console.log(`⛽ Gas used: ${receipt?.gasUsed.toString()}`);
  }

  deploymentInfo.contracts.FeeDelegationManager = {
    address: feeDelegationAddress,
    transactionHash: feeDelegationTx?.hash,
    gasUsed: feeDelegationTx ? (await feeDelegationTx.wait())?.gasUsed.toString() : undefined
  };


  // Deploy VeBetterIntegration
  console.log('\n⏳ Deploying VeBetterIntegration contract...');
  const VeBetterIntegration = await ethers.getContractFactory('VeBetterIntegration');
  const veBetterIntegration = await VeBetterIntegration.deploy(
    nftAddress
  );
  await veBetterIntegration.waitForDeployment();
  const veBetterAddress = await veBetterIntegration.getAddress();
  
  console.log('✅ VeBetterIntegration deployed successfully!');
  console.log(`📍 VeBetterIntegration address: ${veBetterAddress}`);

  const veBetterDeploymentTx = veBetterIntegration.deploymentTransaction();
  if (veBetterDeploymentTx) {
    console.log(`🔗 Transaction hash: ${veBetterDeploymentTx.hash}`);
    const receipt = await veBetterDeploymentTx.wait();
    console.log(`⛽ Gas used: ${receipt?.gasUsed.toString()}`);
  }

  deploymentInfo.contracts.VeBetterIntegration = {
    address: veBetterAddress,
    carbonCreditNFT: nftAddress,
    b3trToken: '0x5ef79995FE8a89e0812330E4378eB2660ceDe699',
    transactionHash: veBetterDeploymentTx?.hash,
    gasUsed: veBetterDeploymentTx ? (await veBetterDeploymentTx.wait())?.gasUsed.toString() : undefined
  };

  // Grant MINTER_ROLE to deployer for direct minting
  console.log('\n🔗 Setting up contract integrations...');
  const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
  const BRIDGE_ROLE = '0x52ba824bfabc2bcfcdf7f0edbb486ebb05e1836c90e78047efeb949990f72e5f';
  
  await carbonCreditNFT.grantRole(MINTER_ROLE, deployer.address);
  console.log('✅ Granted MINTER_ROLE to deployer');

  // Grant BRIDGE_ROLE to deployer for bridge operations
  await carbonCreditNFT.grantRole(BRIDGE_ROLE, deployer.address);
  console.log('✅ Granted BRIDGE_ROLE to deployer');

  // Verify roles for CarbonCreditNFT
  console.log('\n🔐 Verifying CarbonCreditNFT role assignments...');
  const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const BURNER_ROLE = '0x3c11d16cbaffd01df69ce1c404f6340ee057498f5f00246190ea54220576a848';
  const hasAdminRole = await carbonCreditNFT.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasMinterRole = await carbonCreditNFT.hasRole(MINTER_ROLE, deployer.address);
  const hasBurnerRole = await carbonCreditNFT.hasRole(BURNER_ROLE, deployer.address);
  const hasBridgeRole = await carbonCreditNFT.hasRole(BRIDGE_ROLE, deployer.address);
  console.log(`   Admin Role: ${hasAdminRole ? '✅' : '❌'}`);
  console.log(`   Minter Role: ${hasMinterRole ? '✅' : '❌'}`);
  console.log(`   Burner Role: ${hasBurnerRole ? '✅' : '❌'}`);
  console.log(`   Bridge Role: ${hasBridgeRole ? '✅' : '❌'}`);

  // Verify roles for registries
  console.log('\n🔐 Verifying registry role assignments...');
  const orgAdminRole = await organizationRegistry.hasRole(await organizationRegistry.DEFAULT_ADMIN_ROLE(), deployer.address);
  const orgVerifierRole = await organizationRegistry.hasRole(await organizationRegistry.VERIFIER_ROLE(), deployer.address);
  const farmerAdminRole = await farmerRegistry.hasRole(await farmerRegistry.DEFAULT_ADMIN_ROLE(), deployer.address);
  const farmerVerifierRole = await farmerRegistry.hasRole(await farmerRegistry.VERIFIER_ROLE(), deployer.address);

  console.log(`   OrganizationRegistry Admin: ${orgAdminRole ? '✅' : '❌'}`);
  console.log(`   OrganizationRegistry Verifier: ${orgVerifierRole ? '✅' : '❌'}`);
  console.log(`   FarmerRegistry Admin: ${farmerAdminRole ? '✅' : '❌'}`);
  console.log(`   FarmerRegistry Verifier: ${farmerVerifierRole ? '✅' : '❌'}`);


  // Verify roles for fee delegation manager
  console.log('\n🔐 Verifying FeeDelegationManager role assignments...');
  const feeAdminRole = await feeDelegationManager.hasRole(await feeDelegationManager.DEFAULT_ADMIN_ROLE(), deployer.address);
  const feeSponsorRole = await feeDelegationManager.hasRole(await feeDelegationManager.SPONSOR_ROLE(), deployer.address);
  const feePolicyRole = await feeDelegationManager.hasRole(await feeDelegationManager.POLICY_MANAGER_ROLE(), deployer.address);

  console.log(`   Fee Delegation Admin Role: ${feeAdminRole ? '✅' : '❌'}`);
  console.log(`   Fee Delegation Sponsor Role: ${feeSponsorRole ? '✅' : '❌'}`);
  console.log(`   Fee Delegation Policy Manager Role: ${feePolicyRole ? '✅' : '❌'}`);

  // Verify roles for VeBetter integration
  console.log('\n🔐 Verifying VeBetterIntegration role assignments...');
  const veBetterAdminRole = await veBetterIntegration.hasRole(await veBetterIntegration.DEFAULT_ADMIN_ROLE(), deployer.address);
  const veBetterRewardRole = await veBetterIntegration.hasRole(await veBetterIntegration.REWARD_MANAGER_ROLE(), deployer.address);
  const veBetterClaimRole = await veBetterIntegration.hasRole(await veBetterIntegration.CLAIM_MANAGER_ROLE(), deployer.address);

  console.log(`   VeBetter Admin Role: ${veBetterAdminRole ? '✅' : '❌'}`);
  console.log(`   VeBetter Reward Manager Role: ${veBetterRewardRole ? '✅' : '❌'}`);
  console.log(`   VeBetter Claim Manager Role: ${veBetterClaimRole ? '✅' : '❌'}`);

  // Network-specific information
  if (network.name === 'vechain_testnet') {
    console.log('\n🌐 VeChain Testnet Information:');
    console.log('   Explorer: https://explore-testnet.vechain.org');
    console.log('   Faucet: https://faucet.vechain.org');
    console.log('   Fee Delegation: https://sponsor-testnet.vechain.energy/by/269');
  } else if (network.name === 'vechain_mainnet') {
    console.log('\n🌐 VeChain Mainnet Information:');
    console.log('   Explorer: https://explore.vechain.org');
    console.log('   ⚠️  WARNING: This is mainnet deployment!');
  } else if (network.name === 'vechain_solo') {
    console.log('\n🌐 Thor Solo Information:');
    console.log('   Local development network');
    console.log('   URL: http://localhost:8669');
  }

  // Create deployments directory if it doesn't exist
  const deploymentsDir = join(__dirname, '..', 'deployments');
  try {
    mkdirSync(deploymentsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }

  // Save deployment artifact
  const deploymentFile = join(deploymentsDir, `VeChainCarbonCreditSystem-${network.name}.json`);
  writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  console.log('\n🎉 All contracts deployed successfully!');
  console.log('\n📋 Deployment Summary:');
  console.log(`   OrganizationRegistry: ${orgRegistryAddress}`);
  console.log(`   FarmerRegistry: ${farmerRegistryAddress}`);
  console.log(`   CarbonCreditNFT: ${nftAddress}`);
  console.log(`   FeeDelegationManager: ${feeDelegationAddress}`);
  console.log(`   VeBetterIntegration: ${veBetterAddress}`);
  
  console.log('\n📝 Next steps:');
  console.log('   1. Verify all contracts on VeChain explorer');
  console.log('   2. Register sponsors in FeeDelegationManager for gasless transactions');
  console.log('   3. Register organizations and farmers using the registry contracts');
  console.log('   4. Mint carbon credit NFTs directly using the CarbonCreditNFT contract');
  console.log('   5. Users can interact with contracts using VIP-191 fee delegation!');
  console.log('   6. Activate users in VeBetterIntegration to earn B3TR rewards!');
  console.log('   7. Deposit B3TR tokens to the reward pool for distribution');
  console.log('   8. Users earn B3TR tokens for generating carbon credits!');
  console.log('   9. Bridge carbon credits to other blockchains using Wanchain!');
  console.log('   10. Test cross-chain functionality with npm run test:bridge');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  });
