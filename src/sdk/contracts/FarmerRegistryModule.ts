import { Connex } from '@vechain/connex';
import { ethers } from 'ethers';
import { VeChainCarbonCreditSDK } from '../VeChainSDK';

/**
 * Farmer Registry Module
 * Handles all interactions with the FarmerRegistry contract
 */

export interface RegisterFarmerParams {
  name: string;
  location: string;
  walletAddress: string;
  landSize: string;
  associatedOrg: number;
  verificationDocumentsHash: string;
}

export interface UpdateFarmerParams {
  farmerId: number;
  name: string;
  location: string;
  walletAddress: string;
  landSize: string;
  verificationDocumentsHash: string;
}

export interface UpdateOrganizationAssociationParams {
  farmerId: number;
  newOrgId: number;
}

export interface VerifyFarmerParams {
  farmerId: number;
  verificationStatus: number;
}

export interface SetFarmerStatusParams {
  farmerId: number;
  status: number;
}

export class FarmerRegistryModule {
  private sdk: VeChainCarbonCreditSDK;
  private contractAddress: string;

  constructor(sdk: VeChainCarbonCreditSDK) {
    this.sdk = sdk;
    this.contractAddress = sdk.getContractAddresses().farmerRegistry;
  }

  /**
   * Register a new farmer
   */
  async registerFarmer(params: RegisterFarmerParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'walletAddress', type: 'address' },
        { name: 'landSize', type: 'uint256' },
        { name: 'associatedOrg', type: 'uint256' },
        { name: 'verificationDocumentsHash', type: 'string' }
      ],
      name: 'registerFarmer',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.name,
      params.location,
      params.walletAddress,
      params.landSize,
      params.associatedOrg,
      params.verificationDocumentsHash
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Update farmer information
   */
  async updateFarmer(params: UpdateFarmerParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'farmerId', type: 'uint256' },
        { name: 'name', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'walletAddress', type: 'address' },
        { name: 'landSize', type: 'uint256' },
        { name: 'verificationDocumentsHash', type: 'string' }
      ],
      name: 'updateFarmer',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.farmerId,
      params.name,
      params.location,
      params.walletAddress,
      params.landSize,
      params.verificationDocumentsHash
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Update farmer's organization association
   */
  async updateOrganizationAssociation(params: UpdateOrganizationAssociationParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'farmerId', type: 'uint256' },
        { name: 'newOrgId', type: 'uint256' }
      ],
      name: 'updateOrganizationAssociation',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.farmerId, params.newOrgId);
    return await this.executeTransaction([clause]);
  }

  /**
   * Verify farmer
   */
  async verifyFarmer(params: VerifyFarmerParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'farmerId', type: 'uint256' },
        { name: 'verificationStatus', type: 'uint8' }
      ],
      name: 'verifyFarmer',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.farmerId, params.verificationStatus);
    return await this.executeTransaction([clause]);
  }

  /**
   * Set farmer status
   */
  async setFarmerStatus(params: SetFarmerStatusParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'farmerId', type: 'uint256' },
        { name: 'status', type: 'uint8' }
      ],
      name: 'setFarmerStatus',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.farmerId, params.status);
    return await this.executeTransaction([clause]);
  }

  /**
   * Get farmer profile
   */
  async getFarmerProfile(farmerId: number) {
    return await this.sdk.getFarmerProfile(farmerId);
  }

  /**
   * Get farmer by wallet address
   */
  async getFarmerByWallet(walletAddress: string): Promise<number> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'walletAddress', type: 'address' }],
      name: 'getFarmerByWallet',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(walletAddress);
    return parseInt(result[0].toString());
  }

  /**
   * Check if farmer exists
   */
  async farmerExists(farmerId: number): Promise<boolean> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'farmerId', type: 'uint256' }],
      name: 'farmerExists',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(farmerId);
    return result[0];
  }

  /**
   * Get total number of farmers
   */
  async getTotalFarmers(): Promise<number> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [],
      name: 'getTotalFarmers',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return parseInt(result[0].toString());
  }

  /**
   * Get all farmer IDs
   */
  async getAllFarmerIds(): Promise<number[]> {
    const total = await this.getTotalFarmers();
    const farmerIds: number[] = [];
    
    for (let i = 1; i <= total; i++) {
      try {
        const exists = await this.farmerExists(i);
        if (exists) {
          farmerIds.push(i);
        }
      } catch (error) {
        // Farmer doesn't exist
        continue;
      }
    }
    
    return farmerIds;
  }

  /**
   * Get farmers by verification status
   */
  async getFarmersByStatus(verificationStatus: number): Promise<number[]> {
    const allFarmerIds = await this.getAllFarmerIds();
    const filteredFarmerIds: number[] = [];
    
    for (const farmerId of allFarmerIds) {
      try {
        const profile = await this.getFarmerProfile(farmerId);
        if (profile.verificationStatus === verificationStatus) {
          filteredFarmerIds.push(farmerId);
        }
      } catch (error) {
        // Farmer doesn't exist or error occurred
        continue;
      }
    }
    
    return filteredFarmerIds;
  }

  /**
   * Get verified farmers
   */
  async getVerifiedFarmers(): Promise<number[]> {
    return await this.getFarmersByStatus(1); // 1 = Verified
  }

  /**
   * Get pending farmers
   */
  async getPendingFarmers(): Promise<number[]> {
    return await this.getFarmersByStatus(0); // 0 = Pending
  }

  /**
   * Get rejected farmers
   */
  async getRejectedFarmers(): Promise<number[]> {
    return await this.getFarmersByStatus(2); // 2 = Rejected
  }

  /**
   * Get farmers by organization
   */
  async getFarmersByOrganization(orgId: number): Promise<number[]> {
    const allFarmerIds = await this.getAllFarmerIds();
    const orgFarmerIds: number[] = [];
    
    for (const farmerId of allFarmerIds) {
      try {
        const profile = await this.getFarmerProfile(farmerId);
        if (profile.associatedOrg === orgId) {
          orgFarmerIds.push(farmerId);
        }
      } catch (error) {
        // Farmer doesn't exist or error occurred
        continue;
      }
    }
    
    return orgFarmerIds;
  }

  /**
   * Get independent farmers (not associated with any organization)
   */
  async getIndependentFarmers(): Promise<number[]> {
    return await this.getFarmersByOrganization(0); // 0 = No organization
  }

  /**
   * Search farmers by name
   */
  async searchFarmersByName(searchTerm: string): Promise<number[]> {
    const allFarmerIds = await this.getAllFarmerIds();
    const matchingFarmerIds: number[] = [];
    
    for (const farmerId of allFarmerIds) {
      try {
        const profile = await this.getFarmerProfile(farmerId);
        if (profile.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          matchingFarmerIds.push(farmerId);
        }
      } catch (error) {
        // Farmer doesn't exist or error occurred
        continue;
      }
    }
    
    return matchingFarmerIds;
  }

  /**
   * Search farmers by location
   */
  async searchFarmersByLocation(searchTerm: string): Promise<number[]> {
    const allFarmerIds = await this.getAllFarmerIds();
    const matchingFarmerIds: number[] = [];
    
    for (const farmerId of allFarmerIds) {
      try {
        const profile = await this.getFarmerProfile(farmerId);
        if (profile.location.toLowerCase().includes(searchTerm.toLowerCase())) {
          matchingFarmerIds.push(farmerId);
        }
      } catch (error) {
        // Farmer doesn't exist or error occurred
        continue;
      }
    }
    
    return matchingFarmerIds;
  }

  /**
   * Get farmers by land size range
   */
  async getFarmersByLandSizeRange(minLandSize: string, maxLandSize: string): Promise<number[]> {
    const allFarmerIds = await this.getAllFarmerIds();
    const filteredFarmerIds: number[] = [];
    
    const minSize = BigInt(minLandSize);
    const maxSize = BigInt(maxLandSize);
    
    for (const farmerId of allFarmerIds) {
      try {
        const profile = await this.getFarmerProfile(farmerId);
        const landSize = BigInt(profile.landSize);
        
        if (landSize >= minSize && landSize <= maxSize) {
          filteredFarmerIds.push(farmerId);
        }
      } catch (error) {
        // Farmer doesn't exist or error occurred
        continue;
      }
    }
    
    return filteredFarmerIds;
  }

  /**
   * Get farmer statistics
   */
  async getFarmerStatistics(): Promise<{
    totalFarmers: number;
    verifiedFarmers: number;
    pendingFarmers: number;
    rejectedFarmers: number;
    independentFarmers: number;
    totalLandSize: string;
    averageLandSize: string;
  }> {
    const total = await this.getTotalFarmers();
    const verified = await this.getVerifiedFarmers();
    const pending = await this.getPendingFarmers();
    const rejected = await this.getRejectedFarmers();
    const independent = await this.getIndependentFarmers();
    
    // Calculate total and average land size
    let totalLandSize = BigInt(0);
    const allFarmerIds = await this.getAllFarmerIds();
    
    for (const farmerId of allFarmerIds) {
      try {
        const profile = await this.getFarmerProfile(farmerId);
        totalLandSize += BigInt(profile.landSize);
      } catch (error) {
        // Farmer doesn't exist or error occurred
        continue;
      }
    }
    
    const averageLandSize = allFarmerIds.length > 0 
      ? totalLandSize / BigInt(allFarmerIds.length)
      : BigInt(0);
    
    return {
      totalFarmers: total,
      verifiedFarmers: verified.length,
      pendingFarmers: pending.length,
      rejectedFarmers: rejected.length,
      independentFarmers: independent.length,
      totalLandSize: totalLandSize.toString(),
      averageLandSize: averageLandSize.toString()
    };
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
      const gasLimit = 300000; // Default gas limit for registry operations
      
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

export default FarmerRegistryModule;
