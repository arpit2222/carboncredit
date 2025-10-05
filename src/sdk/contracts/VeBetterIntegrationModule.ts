import { Connex } from '@vechain/connex';
import { ethers } from 'ethers';
import { VeChainCarbonCreditSDK } from '../VeChainSDK';

/**
 * VeBetter Integration Module
 * Handles all interactions with the VeBetterIntegration contract
 */

export interface ClaimRewardsParams {
  userAddress: string;
}

export interface BatchClaimRewardsParams {
  userAddresses: string[];
}

export interface UpdateRewardConfigParams {
  baseRewardRate: string;
  verificationBonus: string;
  maxRewardPerCredit: string;
  minRewardPerCredit: string;
}

export interface SetUserActiveParams {
  userAddress: string;
  isActive: boolean;
}

export interface DepositB3TRParams {
  amount: string;
}

export class VeBetterIntegrationModule {
  private sdk: VeChainCarbonCreditSDK;
  private contractAddress: string;

  constructor(sdk: VeChainCarbonCreditSDK) {
    this.sdk = sdk;
    this.contractAddress = sdk.getContractAddresses().veBetterIntegration;
  }

  /**
   * Claim B3TR rewards for a user
   */
  async claimRewards(params: ClaimRewardsParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'userAddress', type: 'address' }
      ],
      name: 'claimRewards',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.userAddress);
    return await this.executeTransaction([clause]);
  }

  /**
   * Batch claim B3TR rewards for multiple users
   */
  async batchClaimRewards(params: BatchClaimRewardsParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'userAddresses', type: 'address[]' }
      ],
      name: 'batchClaimRewards',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.userAddresses);
    return await this.executeTransaction([clause]);
  }

  /**
   * Update reward configuration
   */
  async updateRewardConfig(params: UpdateRewardConfigParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'baseRewardRate', type: 'uint256' },
        { name: 'verificationBonus', type: 'uint256' },
        { name: 'maxRewardPerCredit', type: 'uint256' },
        { name: 'minRewardPerCredit', type: 'uint256' }
      ],
      name: 'updateRewardConfig',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.baseRewardRate,
      params.verificationBonus,
      params.maxRewardPerCredit,
      params.minRewardPerCredit
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Set user active status
   */
  async setUserActive(params: SetUserActiveParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'userAddress', type: 'address' },
        { name: 'isActive', type: 'bool' }
      ],
      name: 'setUserActive',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.userAddress, params.isActive);
    return await this.executeTransaction([clause]);
  }

  /**
   * Deposit B3TR tokens to the reward pool
   */
  async depositB3TR(params: DepositB3TRParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'amount', type: 'uint256' }
      ],
      name: 'depositB3TR',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.amount);
    return await this.executeTransaction([clause]);
  }

  /**
   * Get user reward information
   */
  async getUserRewardInfo(userAddress: string) {
    return await this.sdk.getUserRewardInfo(userAddress);
  }

  /**
   * Get B3TR token balance in the reward pool
   */
  async getB3TRBalance(): Promise<string> {
    return await this.sdk.getB3TRBalance();
  }

  /**
   * Calculate potential B3TR reward
   */
  async calculatePotentialReward(carbonAmount: string, isVerified: boolean): Promise<string> {
    return await this.sdk.calculatePotentialReward(carbonAmount, isVerified);
  }

  /**
   * Get reward configuration
   */
  async getRewardConfig(): Promise<{
    baseRewardRate: string;
    verificationBonus: string;
    maxRewardPerCredit: string;
    minRewardPerCredit: string;
    totalRewardsDistributed: string;
    totalUsers: number;
    activeUsers: number;
  }> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [],
      name: 'getRewardConfig',
      outputs: [
        { name: 'baseRewardRate', type: 'uint256' },
        { name: 'verificationBonus', type: 'uint256' },
        { name: 'maxRewardPerCredit', type: 'uint256' },
        { name: 'minRewardPerCredit', type: 'uint256' },
        { name: 'totalRewardsDistributed', type: 'uint256' },
        { name: 'totalUsers', type: 'uint256' },
        { name: 'activeUsers', type: 'uint256' }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    
    return {
      baseRewardRate: result[0].toString(),
      verificationBonus: result[1].toString(),
      maxRewardPerCredit: result[2].toString(),
      minRewardPerCredit: result[3].toString(),
      totalRewardsDistributed: result[4].toString(),
      totalUsers: parseInt(result[5].toString()),
      activeUsers: parseInt(result[6].toString())
    };
  }

  /**
   * Get total rewards distributed
   */
  async getTotalRewardsDistributed(): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [],
      name: 'getTotalRewardsDistributed',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return result[0].toString();
  }

  /**
   * Get total number of users
   */
  async getTotalUsers(): Promise<number> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [],
      name: 'getTotalUsers',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return parseInt(result[0].toString());
  }

  /**
   * Get number of active users
   */
  async getActiveUsers(): Promise<number> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [],
      name: 'getActiveUsers',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return parseInt(result[0].toString());
  }

  /**
   * Check if user is active
   */
  async isUserActive(userAddress: string): Promise<boolean> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'userAddress', type: 'address' }],
      name: 'isUserActive',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(userAddress);
    return result[0];
  }

  /**
   * Get user's total earned rewards
   */
  async getUserTotalEarned(userAddress: string): Promise<string> {
    const rewardInfo = await this.getUserRewardInfo(userAddress);
    return rewardInfo.totalEarned;
  }

  /**
   * Get user's pending rewards
   */
  async getUserPendingRewards(userAddress: string): Promise<string> {
    const rewardInfo = await this.getUserRewardInfo(userAddress);
    return rewardInfo.pendingRewards;
  }

  /**
   * Get user's total claimed rewards
   */
  async getUserTotalClaimed(userAddress: string): Promise<string> {
    const rewardInfo = await this.getUserRewardInfo(userAddress);
    return rewardInfo.totalClaimed;
  }

  /**
   * Get user's last claim time
   */
  async getUserLastClaimTime(userAddress: string): Promise<number> {
    const rewardInfo = await this.getUserRewardInfo(userAddress);
    return rewardInfo.lastClaimTime;
  }

  /**
   * Get user's total carbon credits
   */
  async getUserTotalCarbonCredits(userAddress: string): Promise<string> {
    const rewardInfo = await this.getUserRewardInfo(userAddress);
    return rewardInfo.totalCarbonCredits;
  }

  /**
   * Get user's reward eligible credits
   */
  async getUserRewardEligibleCredits(userAddress: string): Promise<string> {
    const rewardInfo = await this.getUserRewardInfo(userAddress);
    return rewardInfo.rewardEligibleCredits;
  }

  /**
   * Get reward statistics
   */
  async getRewardStatistics(): Promise<{
    totalRewardsDistributed: string;
    totalUsers: number;
    activeUsers: number;
    averageRewardPerUser: string;
    totalCarbonCredits: string;
    rewardEligibleCredits: string;
    b3trBalance: string;
  }> {
    const config = await this.getRewardConfig();
    const b3trBalance = await this.getB3TRBalance();
    
    // Calculate average reward per user
    const averageRewardPerUser = config.totalUsers > 0 
      ? (BigInt(config.totalRewardsDistributed) / BigInt(config.totalUsers)).toString()
      : '0';

    // Calculate total carbon credits and reward eligible credits
    let totalCarbonCredits = BigInt(0);
    let rewardEligibleCredits = BigInt(0);
    
    // This would require iterating through all users, which is expensive
    // In a real implementation, you'd want to track these values in the contract
    
    return {
      totalRewardsDistributed: config.totalRewardsDistributed,
      totalUsers: config.totalUsers,
      activeUsers: config.activeUsers,
      averageRewardPerUser,
      totalCarbonCredits: totalCarbonCredits.toString(),
      rewardEligibleCredits: rewardEligibleCredits.toString(),
      b3trBalance
    };
  }

  /**
   * Get top reward earners
   */
  async getTopRewardEarners(limit: number = 10): Promise<Array<{
    userAddress: string;
    totalEarned: string;
    totalClaimed: string;
    pendingRewards: string;
  }>> {
    // This is a simplified implementation
    // In a real scenario, you'd need to track user addresses and their rewards
    // This would require additional contract functions or event parsing
    
    const topEarners: Array<{
      userAddress: string;
      totalEarned: string;
      totalClaimed: string;
      pendingRewards: string;
    }> = [];
    
    // For now, return empty array
    // In production, you'd implement proper tracking
    return topEarners;
  }

  /**
   * Get reward distribution history
   */
  async getRewardDistributionHistory(
    userAddress: string,
    limit: number = 50
  ): Promise<Array<{
    timestamp: number;
    amount: string;
    transactionHash: string;
  }>> {
    // This would require parsing events from the contract
    // For now, return empty array
    // In production, you'd implement event parsing
    
    const history: Array<{
      timestamp: number;
      amount: string;
      transactionHash: string;
    }> = [];
    
    return history;
  }

  /**
   * Execute transaction with fee delegation if enabled
   */
  private async executeTransaction(clauses: any[]): Promise<string> {
    if (!this.sdk['config'].wallet) {
      throw new Error('Wallet not configured');
    }

    const wallet = this.sdk['config'].wallet;
    
    // Use fee delegation if enabled
    if (this.sdk.isFeeDelegationEnabled() && this.sdk.getFeeDelegationManager()) {
      const feeDelegation = this.sdk.getFeeDelegationManager()!;
      const gasLimit = 300000; // Default gas limit for VeBetter operations
      
      return await feeDelegation.signAndSendWithDelegation(
        { clauses },
        wallet,
        gasLimit
      );
    } else {
      // Regular transaction
      const tx = {
        clauses,
        gas: 300000,
        gasPrice: '0x0'
      };

      const signedTx = await wallet.signTransaction(tx);
      const result = await this.sdk['config'].connex.thor.transaction(signedTx).send();
      return result.txid;
    }
  }
}

export default VeBetterIntegrationModule;
