# VeBetter DAO B3TR Token Integration Guide

## Overview

This guide explains how the VeChain Carbon Credit System integrates with VeBetter DAO to distribute B3TR token rewards for carbon credit generation, creating a gamified sustainability experience.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Carbon Credit │    │ VeBetter         │    │   B3TR Token    │
│   Generation    │───▶│ Integration      │───▶│   Rewards       │
│                 │    │ Contract         │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NFT Minting   │    │  Reward          │    │   User Claims   │
│   & Metadata    │    │  Calculation     │    │   & Tracking    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Smart Contract Integration

### VeBetterIntegration Contract

The `VeBetterIntegration.sol` contract serves as the bridge between carbon credit generation and B3TR token rewards.

#### Key Features:
- **Reward Calculation**: Automatic B3TR reward calculation based on carbon amount
- **Verification Bonus**: 150% bonus for verified carbon credits
- **User Management**: Activation/deactivation of users for rewards
- **Claim System**: Users can claim pending B3TR rewards
- **Batch Operations**: Efficient batch claiming for multiple users

#### Contract Addresses:
- **VeChain Mainnet**: `[deployed-address]`
- **B3TR Token**: `0x5ef79995FE8a89e0812330E4378eB2660ceDe699`

## Reward Mechanism

### Base Reward Structure
```
Base Reward: 100 B3TR per tonne of carbon credit
Verified Bonus: 150% bonus (150 B3TR additional per tonne)
Maximum Cap: 500 B3TR per tonne
Minimum Threshold: 1 tonne to earn rewards
```

### Example Calculations

#### Unverified Carbon Credit (100 tonnes)
```
Base Reward: 100 tonnes × 100 B3TR = 10,000 B3TR
Total Reward: 10,000 B3TR
```

#### Verified Carbon Credit (100 tonnes)
```
Base Reward: 100 tonnes × 100 B3TR = 10,000 B3TR
Bonus (150%): 10,000 B3TR × 1.5 = 15,000 B3TR
Total Reward: 25,000 B3TR
```

#### Large Carbon Credit (10,000 tonnes) - Capped
```
Base Reward: 10,000 tonnes × 100 B3TR = 1,000,000 B3TR
Bonus (150%): 1,000,000 B3TR × 1.5 = 1,500,000 B3TR
Capped at: 10,000 tonnes × 500 B3TR = 5,000,000 B3TR
Total Reward: 5,000,000 B3TR (capped)
```

## User Workflow

### 1. User Activation
```solidity
// Admin activates user for rewards
veBetterIntegration.setUserActive(userAddress, true);
```

### 2. Carbon Credit Generation
```solidity
// User submits verification request
carbonCreditVerifier.submitVerificationRequest(
    farmerId,
    orgId,
    carbonAmount,
    location,
    projectType,
    projectDescription,
    technicalDocumentsHash,
    fieldEvidenceHash,
    monitoringPlanHash
);
```

### 3. Verification Process
```solidity
// Verifier approves the request
carbonCreditVerifier.approveVerificationRequest(requestId, tokenURI);
```

### 4. Reward Calculation
```solidity
// Reward manager calculates B3TR rewards
veBetterIntegration.calculateReward(tokenId, userAddress);
```

### 5. Reward Claiming
```solidity
// User claims pending rewards
veBetterIntegration.claimRewards(0); // 0 = claim all pending
```

## Integration with Existing Contracts

### CarbonCreditNFT Integration
```solidity
// VeBetterIntegration reads NFT metadata
CarbonCreditNFT.CarbonCreditMetadata memory metadata = 
    carbonCreditNFT.getCreditMetadata(tokenId);

// Extracts carbon amount and verification status
uint256 carbonAmount = metadata.carbonAmount;
bool isVerified = metadata.verificationStatus == VerificationStatus.Verified;
```

### CarbonCreditVerifier Integration
```solidity
// VeBetterIntegration references verifier for validation
address verifierAddress = veBetterIntegration.carbonCreditVerifier();
```

## JavaScript Integration

### Using VeBetter Integration

```typescript
import { VeBetterIntegration } from './contracts/VeBetterIntegration';

// Initialize contract
const veBetterIntegration = new ethers.Contract(
  veBetterAddress,
  VeBetterIntegrationABI,
  provider
);

// Check user reward info
const userRewardInfo = await veBetterIntegration.getUserRewardInfo(userAddress);
console.log(`Total Earned: ${ethers.formatEther(userRewardInfo.totalEarned)} B3TR`);
console.log(`Pending Rewards: ${ethers.formatEther(userRewardInfo.pendingRewards)} B3TR`);

// Calculate potential reward
const potentialReward = await veBetterIntegration.calculatePotentialReward(
  ethers.parseEther('100'), // 100 tonnes
  true // verified
);
console.log(`Potential Reward: ${ethers.formatEther(potentialReward)} B3TR`);

// Claim rewards
const tx = await veBetterIntegration.connect(userWallet).claimRewards(0);
await tx.wait();
```

### Batch Operations

```typescript
// Batch claim rewards for multiple users
const users = [user1.address, user2.address, user3.address];
const amounts = [
  ethers.parseEther('1000'), // 1000 B3TR
  ethers.parseEther('500'),  // 500 B3TR
  ethers.parseEther('750')   // 750 B3TR
];

const tx = await veBetterIntegration.connect(claimManager).batchClaimRewards(users, amounts);
await tx.wait();
```

## Admin Functions

### Reward Configuration Management

```typescript
// Update reward configuration
await veBetterIntegration.connect(rewardManager).updateRewardConfig(
  ethers.parseEther('200'), // New base reward: 200 B3TR per tonne
  20000,                    // New bonus: 200% (20000 basis points)
  ethers.parseEther('1000'), // New max reward: 1000 B3TR per tonne
  ethers.parseEther('0.5'),  // New minimum: 0.5 tonnes
  true                       // Keep rewards active
);
```

### User Management

```typescript
// Activate user for rewards
await veBetterIntegration.connect(rewardManager).setUserActive(userAddress, true);

// Deactivate user
await veBetterIntegration.connect(rewardManager).setUserActive(userAddress, false);
```

### B3TR Token Management

```typescript
// Deposit B3TR tokens to reward pool
const depositAmount = ethers.parseEther('100000'); // 100,000 B3TR
await b3trToken.connect(admin).approve(veBetterAddress, depositAmount);
await veBetterIntegration.connect(admin).depositB3TR(depositAmount);

// Check B3TR balance
const balance = await veBetterIntegration.getB3TRBalance();
console.log(`Reward Pool Balance: ${ethers.formatEther(balance)} B3TR`);
```

## Event Monitoring

### Key Events to Monitor

```typescript
// Listen for reward calculations
veBetterIntegration.on('CarbonCreditRewarded', (tokenId, user, carbonAmount, b3trReward, isVerified) => {
  console.log(`Reward calculated for token ${tokenId}:`);
  console.log(`  User: ${user}`);
  console.log(`  Carbon Amount: ${ethers.formatEther(carbonAmount)} tonnes`);
  console.log(`  B3TR Reward: ${ethers.formatEther(b3trReward)}`);
  console.log(`  Verified: ${isVerified}`);
});

// Listen for reward claims
veBetterIntegration.on('RewardsClaimed', (user, amount, timestamp) => {
  console.log(`User ${user} claimed ${ethers.formatEther(amount)} B3TR at ${new Date(timestamp * 1000)}`);
});

// Listen for configuration updates
veBetterIntegration.on('RewardConfigUpdated', (baseReward, bonusMultiplier, maxReward, isActive) => {
  console.log('Reward configuration updated:');
  console.log(`  Base Reward: ${ethers.formatEther(baseReward)} B3TR per tonne`);
  console.log(`  Bonus Multiplier: ${bonusMultiplier / 100}%`);
  console.log(`  Max Reward: ${ethers.formatEther(maxReward)} B3TR per tonne`);
  console.log(`  Active: ${isActive}`);
});
```

## Security Considerations

### Access Control
- **Admin Role**: Full control over contract configuration
- **Reward Manager Role**: Can calculate rewards and manage users
- **Claim Manager Role**: Can batch claim rewards for users
- **User Role**: Can claim their own rewards

### Reentrancy Protection
- All external functions use `nonReentrant` modifier
- SafeERC20 for token transfers
- Proper state updates before external calls

### Input Validation
- Carbon amount must meet minimum threshold
- Reward calculations are capped to prevent overflow
- User addresses are validated before operations

## Testing

### Unit Tests
```bash
# Run VeBetter integration tests
npm test test/VeBetterIntegration.test.ts

# Run all tests
npm test
```

### Test Coverage
- Reward calculation logic
- User management functions
- Claim mechanisms
- Access control
- Edge cases and error conditions

## Deployment

### Deploy All Contracts
```bash
# Deploy to VeChain testnet
npm run deploy:testnet

# Deploy to VeChain mainnet
npm run deploy:mainnet
```

### Post-Deployment Setup
1. **Activate Users**: Set users as active for rewards
2. **Deposit B3TR**: Add B3TR tokens to reward pool
3. **Configure Rewards**: Set appropriate reward parameters
4. **Monitor Events**: Set up event monitoring for analytics

## Analytics and Monitoring

### Key Metrics to Track
- **Total B3TR Distributed**: Cumulative rewards given out
- **Active Users**: Number of users earning rewards
- **Carbon Credits Generated**: Total tonnes of carbon credits
- **Average Reward per User**: B3TR earned per user
- **Claim Rate**: Percentage of earned rewards claimed

### Dashboard Integration
```typescript
// Get comprehensive statistics
const totalUsers = await veBetterIntegration.getTotalUsers();
const activeUsers = await veBetterIntegration.getActiveUsers();
const totalRewardedCredits = await veBetterIntegration.getAllRewardedCredits();
const b3trBalance = await veBetterIntegration.getB3TRBalance();

// Calculate metrics
const totalCredits = totalRewardedCredits.length;
const activeUserCount = activeUsers.length;
const rewardPoolBalance = ethers.formatEther(b3trBalance);
```

## Future Enhancements

### Planned Features
1. **Tiered Rewards**: Different reward rates based on user level
2. **Seasonal Bonuses**: Special reward multipliers for events
3. **Referral System**: Rewards for referring new users
4. **Staking Rewards**: Additional B3TR for staking carbon credits
5. **Governance Integration**: B3TR holders can vote on reward parameters

### Integration Opportunities
- **VeBetter DAO Governance**: Participate in DAO decisions
- **Cross-Platform Rewards**: Integrate with other VeBetter apps
- **NFT Marketplace**: Trade carbon credit NFTs for B3TR
- **DeFi Integration**: Use B3TR rewards in DeFi protocols

## Support and Resources

### Documentation
- [VeBetter DAO Documentation](https://docs.vebetter.io)
- [B3TR Token Information](https://vebetter.io/token)
- [VeChain Developer Resources](https://docs.vechain.org)

### Community
- [VeBetter DAO Discord](https://discord.gg/vebetter)
- [VeChain Community](https://community.vechain.org)
- [Developer Forums](https://forum.vechain.org)

### Technical Support
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Email Support: [support@your-domain.com]
- Documentation: [docs.your-domain.com]

This integration creates a powerful incentive system that rewards users for their environmental contributions while building a sustainable ecosystem on VeChain.
