import { ethers } from 'ethers';
import { Connex } from '@vechain/connex';

/**
 * VeChain Fee Delegation Utilities
 * Implements VIP-191 fee delegation for gasless transactions
 */

export interface DelegationConfig {
  sponsorUrl: string;
  sponsorAddress: string;
  gasLimit: number;
  gasPrice?: string;
}

export interface DelegationRequest {
  user: string;
  sponsor: string;
  gasLimit: number;
  gasPrice?: string;
  timestamp: number;
}

export interface DelegationResponse {
  requestId: string;
  approved: boolean;
  reason?: string;
  delegationUrl?: string;
}

/**
 * VeChain Fee Delegation Manager
 * Handles VIP-191 fee delegation for gasless transactions
 */
export class VeChainFeeDelegation {
  private connex: Connex;
  private sponsorUrl: string;

  constructor(connex: Connex, sponsorUrl: string = 'https://sponsor-testnet.vechain.energy/by/269') {
    this.connex = connex;
    this.sponsorUrl = sponsorUrl;
  }

  /**
   * Request fee delegation from sponsor
   * @param userAddress User's wallet address
   * @param gasLimit Gas limit for the transaction
   * @param sponsorAddress Optional specific sponsor address
   * @returns Delegation request response
   */
  async requestDelegation(
    userAddress: string,
    gasLimit: number,
    sponsorAddress?: string
  ): Promise<DelegationResponse> {
    try {
      const delegationRequest: DelegationRequest = {
        user: userAddress,
        sponsor: sponsorAddress || '0x0000000000000000000000000000000000000000',
        gasLimit,
        timestamp: Date.now()
      };

      // For now, we'll use the public sponsor service
      // In production, this would integrate with your FeeDelegationManager contract
      const response = await fetch(`${this.sponsorUrl}/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(delegationRequest)
      });

      if (!response.ok) {
        throw new Error(`Delegation request failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        requestId: result.requestId || ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(delegationRequest))),
        approved: result.approved || true, // Default to approved for public sponsors
        reason: result.reason,
        delegationUrl: result.delegationUrl
      };
    } catch (error) {
      console.error('Fee delegation request failed:', error);
      throw error;
    }
  }

  /**
   * Sign and send transaction with fee delegation
   * @param transaction Transaction to sign
   * @param userWallet User's wallet (for signing)
   * @param gasLimit Gas limit for the transaction
   * @returns Transaction receipt
   */
  async signAndSendWithDelegation(
    transaction: any,
    userWallet: ethers.Wallet,
    gasLimit: number
  ): Promise<any> {
    try {
      // Request delegation
      const delegation = await this.requestDelegation(userWallet.address, gasLimit);
      
      if (!delegation.approved) {
        throw new Error(`Delegation not approved: ${delegation.reason}`);
      }

      // Create the transaction with delegation
      const delegatedTx = {
        ...transaction,
        gas: gasLimit,
        gasPrice: '0x0', // Set to 0 for delegated transactions
        // Add delegation metadata
        delegation: {
          sponsor: delegation.delegationUrl || this.sponsorUrl,
          requestId: delegation.requestId
        }
      };

      // Sign the transaction
      const signedTx = await userWallet.signTransaction(delegatedTx);
      
      // Send the transaction
      const txResponse = await this.connex.thor.transaction(signedTx).send();
      
      return txResponse;
    } catch (error) {
      console.error('Delegated transaction failed:', error);
      throw error;
    }
  }

  /**
   * Check if delegation is available for a user
   * @param userAddress User's wallet address
   * @param gasLimit Required gas limit
   * @returns Whether delegation is available
   */
  async isDelegationAvailable(userAddress: string, gasLimit: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.sponsorUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userAddress,
          gasLimit
        })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.available || false;
    } catch (error) {
      console.error('Delegation check failed:', error);
      return false;
    }
  }

  /**
   * Get available gas limit for delegation
   * @param userAddress User's wallet address
   * @returns Available gas limit
   */
  async getAvailableGasLimit(userAddress: string): Promise<number> {
    try {
      const response = await fetch(`${this.sponsorUrl}/limits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userAddress
        })
      });

      if (!response.ok) {
        return 0;
      }

      const result = await response.json();
      return result.availableGas || 0;
    } catch (error) {
      console.error('Gas limit check failed:', error);
      return 0;
    }
  }
}

/**
 * Contract interaction helpers with fee delegation
 */
export class DelegatedContractInteraction {
  private feeDelegation: VeChainFeeDelegation;
  private connex: Connex;

  constructor(connex: Connex, sponsorUrl?: string) {
    this.connex = connex;
    this.feeDelegation = new VeChainFeeDelegation(connex, sponsorUrl);
  }

  /**
   * Submit verification request with fee delegation
   * @param contractAddress CarbonCreditVerifier contract address
   * @param userWallet User's wallet
   * @param params Verification request parameters
   * @returns Transaction receipt
   */
  async submitVerificationRequest(
    contractAddress: string,
    userWallet: ethers.Wallet,
    params: {
      farmerId: number;
      orgId: number;
      carbonAmount: string;
      location: string;
      projectType: number;
      projectDescription: string;
      technicalDocumentsHash: string;
      fieldEvidenceHash: string;
      monitoringPlanHash: string;
    }
  ): Promise<any> {
    const method = this.connex.thor.account(contractAddress).method({
      constant: false,
      inputs: [
        { name: 'farmerId', type: 'uint256' },
        { name: 'orgId', type: 'uint256' },
        { name: 'carbonAmount', type: 'uint256' },
        { name: 'location', type: 'string' },
        { name: 'projectType', type: 'uint8' },
        { name: 'projectDescription', type: 'string' },
        { name: 'technicalDocumentsHash', type: 'string' },
        { name: 'fieldEvidenceHash', type: 'string' },
        { name: 'monitoringPlanHash', type: 'string' }
      ],
      name: 'submitVerificationRequest',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const transaction = method.asClause(
      params.farmerId,
      params.orgId,
      params.carbonAmount,
      params.location,
      params.projectType,
      params.projectDescription,
      params.technicalDocumentsHash,
      params.fieldEvidenceHash,
      params.monitoringPlanHash
    );

    return await this.feeDelegation.signAndSendWithDelegation(
      transaction,
      userWallet,
      500000 // Estimated gas limit for verification request
    );
  }

  /**
   * Register farmer with fee delegation
   * @param contractAddress FarmerRegistry contract address
   * @param userWallet User's wallet
   * @param params Farmer registration parameters
   * @returns Transaction receipt
   */
  async registerFarmer(
    contractAddress: string,
    userWallet: ethers.Wallet,
    params: {
      name: string;
      location: string;
      walletAddress: string;
      landSize: string;
      associatedOrg: number;
      verificationDocumentsHash: string;
    }
  ): Promise<any> {
    const method = this.connex.thor.account(contractAddress).method({
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

    const transaction = method.asClause(
      params.name,
      params.location,
      params.walletAddress,
      params.landSize,
      params.associatedOrg,
      params.verificationDocumentsHash
    );

    return await this.feeDelegation.signAndSendWithDelegation(
      transaction,
      userWallet,
      300000 // Estimated gas limit for farmer registration
    );
  }

  /**
   * Register organization with fee delegation
   * @param contractAddress OrganizationRegistry contract address
   * @param userWallet User's wallet
   * @param params Organization registration parameters
   * @returns Transaction receipt
   */
  async registerOrganization(
    contractAddress: string,
    userWallet: ethers.Wallet,
    params: {
      name: string;
      walletAddress: string;
      kycDocumentsHash: string;
    }
  ): Promise<any> {
    const method = this.connex.thor.account(contractAddress).method({
      constant: false,
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'walletAddress', type: 'address' },
        { name: 'kycDocumentsHash', type: 'string' }
      ],
      name: 'registerOrganization',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const transaction = method.asClause(
      params.name,
      params.walletAddress,
      params.kycDocumentsHash
    );

    return await this.feeDelegation.signAndSendWithDelegation(
      transaction,
      userWallet,
      200000 // Estimated gas limit for organization registration
    );
  }
}

/**
 * Utility functions for VeChain fee delegation
 */
export const VeChainDelegationUtils = {
  /**
   * Create a VeChain fee delegation instance
   * @param connex Connex instance
   * @param sponsorUrl Optional custom sponsor URL
   * @returns VeChainFeeDelegation instance
   */
  createFeeDelegation: (connex: Connex, sponsorUrl?: string): VeChainFeeDelegation => {
    return new VeChainFeeDelegation(connex, sponsorUrl);
  },

  /**
   * Create a delegated contract interaction instance
   * @param connex Connex instance
   * @param sponsorUrl Optional custom sponsor URL
   * @returns DelegatedContractInteraction instance
   */
  createContractInteraction: (connex: Connex, sponsorUrl?: string): DelegatedContractInteraction => {
    return new DelegatedContractInteraction(connex, sponsorUrl);
  },

  /**
   * Check if the current network supports fee delegation
   * @param chainId Network chain ID
   * @returns Whether fee delegation is supported
   */
  isFeeDelegationSupported: (chainId: number): boolean => {
    // VeChain testnet and mainnet support fee delegation
    return chainId === 100010 || chainId === 100009;
  },

  /**
   * Get default sponsor URL for network
   * @param chainId Network chain ID
   * @returns Default sponsor URL
   */
  getDefaultSponsorUrl: (chainId: number): string => {
    switch (chainId) {
      case 100010: // VeChain testnet
        return 'https://sponsor-testnet.vechain.energy/by/269';
      case 100009: // VeChain mainnet
        return 'https://sponsor.vechain.energy/by/269';
      default:
        throw new Error(`Unsupported network: ${chainId}`);
    }
  }
};

export default VeChainFeeDelegation;
