import { Connex } from '@vechain/connex';
import { ethers } from 'ethers';
import { VeChainCarbonCreditSDK } from '../VeChainSDK';

/**
 * Carbon Credit NFT Module
 * Handles all interactions with the CarbonCreditNFT contract
 */

export interface MintCarbonCreditParams {
  to: string;
  carbonAmount: string;
  location: string;
  projectType: number;
  projectDescription: string;
  technicalDocumentsHash: string;
  fieldEvidenceHash: string;
  monitoringPlanHash: string;
  tokenURI: string;
}

export interface BurnCarbonCreditParams {
  tokenId: number;
  reason: string;
}

export interface RetireCarbonCreditParams {
  tokenId: number;
  retirementReason: string;
}

export interface UpdateVerificationStatusParams {
  tokenId: number;
  newStatus: number;
}

export interface BridgeTokenParams {
  tokenId: number;
  recipient: string;
  destinationChainId: number;
  bridgeTransactionId: number;
}

export class CarbonCreditNFTModule {
  private sdk: VeChainCarbonCreditSDK;
  private contractAddress: string;

  constructor(sdk: VeChainCarbonCreditSDK) {
    this.sdk = sdk;
    this.contractAddress = sdk.getContractAddresses().carbonCreditNFT;
  }

  /**
   * Mint a new carbon credit NFT
   */
  async mintCarbonCredit(params: MintCarbonCreditParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'carbonAmount', type: 'uint256' },
        { name: 'location', type: 'string' },
        { name: 'projectType', type: 'uint8' },
        { name: 'projectDescription', type: 'string' },
        { name: 'technicalDocumentsHash', type: 'string' },
        { name: 'fieldEvidenceHash', type: 'string' },
        { name: 'monitoringPlanHash', type: 'string' },
        { name: 'tokenURI', type: 'string' }
      ],
      name: 'mintCarbonCredit',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.to,
      params.carbonAmount,
      params.location,
      params.projectType,
      params.projectDescription,
      params.technicalDocumentsHash,
      params.fieldEvidenceHash,
      params.monitoringPlanHash,
      params.tokenURI
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Burn a carbon credit NFT
   */
  async burnCarbonCredit(params: BurnCarbonCreditParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'reason', type: 'string' }
      ],
      name: 'burnCarbonCredit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.tokenId, params.reason);
    return await this.executeTransaction([clause]);
  }

  /**
   * Retire a carbon credit NFT
   */
  async retireCarbonCredit(params: RetireCarbonCreditParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'retirementReason', type: 'string' }
      ],
      name: 'retireCarbonCredit',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.tokenId, params.retirementReason);
    return await this.executeTransaction([clause]);
  }

  /**
   * Update verification status of a carbon credit
   */
  async updateVerificationStatus(params: UpdateVerificationStatusParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'newStatus', type: 'uint8' }
      ],
      name: 'updateVerificationStatus',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.tokenId, params.newStatus);
    return await this.executeTransaction([clause]);
  }

  /**
   * Lock token for bridge
   */
  async lockTokenForBridge(params: BridgeTokenParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'destinationChainId', type: 'uint256' },
        { name: 'bridgeTransactionId', type: 'uint256' }
      ],
      name: 'lockTokenForBridge',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.tokenId,
      params.recipient,
      params.destinationChainId,
      params.bridgeTransactionId
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Unlock token from bridge
   */
  async unlockTokenFromBridge(
    tokenId: number,
    recipient: string,
    sourceChainId: number,
    bridgeTransactionId: number
  ): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'recipient', type: 'address' },
        { name: 'sourceChainId', type: 'uint256' },
        { name: 'bridgeTransactionId', type: 'uint256' }
      ],
      name: 'unlockTokenFromBridge',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(tokenId, recipient, sourceChainId, bridgeTransactionId);
    return await this.executeTransaction([clause]);
  }

  /**
   * Update bridge status
   */
  async updateBridgeStatus(
    tokenId: number,
    newStatus: number,
    bridgeTransactionId: number
  ): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'newStatus', type: 'uint8' },
        { name: 'bridgeTransactionId', type: 'uint256' }
      ],
      name: 'updateBridgeStatus',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(tokenId, newStatus, bridgeTransactionId);
    return await this.executeTransaction([clause]);
  }

  /**
   * Transfer carbon credit NFT
   */
  async transferFrom(from: string, to: string, tokenId: number): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' }
      ],
      name: 'transferFrom',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(from, to, tokenId);
    return await this.executeTransaction([clause]);
  }

  /**
   * Approve carbon credit NFT for transfer
   */
  async approve(to: string, tokenId: number): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'tokenId', type: 'uint256' }
      ],
      name: 'approve',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(to, tokenId);
    return await this.executeTransaction([clause]);
  }

  /**
   * Set approval for all tokens
   */
  async setApprovalForAll(operator: string, approved: boolean): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'operator', type: 'address' },
        { name: 'approved', type: 'bool' }
      ],
      name: 'setApprovalForAll',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(operator, approved);
    return await this.executeTransaction([clause]);
  }

  /**
   * Get owner of a token
   */
  async ownerOf(tokenId: number): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'ownerOf',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(tokenId);
    return result[0];
  }

  /**
   * Get token URI
   */
  async tokenURI(tokenId: number): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'tokenURI',
      outputs: [{ name: '', type: 'string' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(tokenId);
    return result[0];
  }

  /**
   * Get balance of an address
   */
  async balanceOf(owner: string): Promise<number> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(owner);
    return parseInt(result[0].toString());
  }

  /**
   * Get approved address for a token
   */
  async getApproved(tokenId: number): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      name: 'getApproved',
      outputs: [{ name: '', type: 'address' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(tokenId);
    return result[0];
  }

  /**
   * Check if operator is approved for all tokens
   */
  async isApprovedForAll(owner: string, operator: string): Promise<boolean> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'operator', type: 'address' }
      ],
      name: 'isApprovedForAll',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(owner, operator);
    return result[0];
  }

  /**
   * Get tokens owned by an address
   */
  async getTokensByOwner(owner: string): Promise<number[]> {
    const balance = await this.balanceOf(owner);
    const tokens: number[] = [];
    
    // This is a simplified implementation
    // In a real scenario, you'd need to track token IDs or use events
    const totalSupply = await this.sdk.getTotalSupply();
    
    for (let i = 1; i <= totalSupply; i++) {
      try {
        const tokenOwner = await this.ownerOf(i);
        if (tokenOwner.toLowerCase() === owner.toLowerCase()) {
          tokens.push(i);
        }
      } catch (error) {
        // Token doesn't exist or is burned
        continue;
      }
    }
    
    return tokens;
  }

  /**
   * Get carbon credit metadata
   */
  async getCreditMetadata(tokenId: number) {
    return await this.sdk.getCarbonCreditMetadata(tokenId);
  }

  /**
   * Check if token is locked for bridge
   */
  async isTokenLocked(tokenId: number): Promise<boolean> {
    return await this.sdk.isTokenLocked(tokenId);
  }

  /**
   * Get bridge information for a token
   */
  async getBridgeInfo(tokenId: number) {
    return await this.sdk.getBridgeInfo(tokenId);
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStatistics() {
    return await this.sdk.getBridgeStatistics();
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
      const gasLimit = 500000; // Default gas limit
      
      return await feeDelegation.signAndSendWithDelegation(
        { clauses },
        wallet,
        gasLimit
      );
    } else {
      // Regular transaction
      const tx = {
        clauses,
        gas: 500000,
        gasPrice: '0x0'
      };

      const signedTx = await wallet.signTransaction(tx);
      const result = await this.sdk['config'].connex.thor.transaction(signedTx).send();
      return result.txid;
    }
  }
}

export default CarbonCreditNFTModule;
