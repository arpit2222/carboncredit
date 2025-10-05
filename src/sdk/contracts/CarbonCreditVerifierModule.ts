import { Connex } from '@vechain/connex';
import { ethers } from 'ethers';
import { VeChainCarbonCreditSDK } from '../VeChainSDK';

/**
 * Carbon Credit Verifier Module
 * Handles all interactions with the CarbonCreditVerifier contract
 */

export interface SubmitVerificationRequestParams {
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

export interface AssignVerifierParams {
  requestId: number;
  verifierAddress: string;
  deadline: number;
}

export interface UpdateVerificationStageParams {
  requestId: number;
  newStage: number;
  comments: string;
}

export interface ApproveVerificationRequestParams {
  requestId: number;
  tokenURI: string;
}

export interface RejectVerificationRequestParams {
  requestId: number;
  reason: string;
}

export class CarbonCreditVerifierModule {
  private sdk: VeChainCarbonCreditSDK;
  private contractAddress: string;

  constructor(sdk: VeChainCarbonCreditSDK) {
    this.sdk = sdk;
    this.contractAddress = sdk.getContractAddresses().carbonCreditVerifier;
  }

  /**
   * Submit a verification request
   */
  async submitVerificationRequest(params: SubmitVerificationRequestParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
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

    const clause = method.asClause(
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

    return await this.executeTransaction([clause]);
  }

  /**
   * Assign verifier to a request
   */
  async assignVerifier(params: AssignVerifierParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'verifierAddress', type: 'address' },
        { name: 'deadline', type: 'uint256' }
      ],
      name: 'assignVerifier',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.requestId,
      params.verifierAddress,
      params.deadline
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Update verification stage
   */
  async updateVerificationStage(params: UpdateVerificationStageParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'newStage', type: 'uint8' },
        { name: 'comments', type: 'string' }
      ],
      name: 'updateVerificationStage',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(
      params.requestId,
      params.newStage,
      params.comments
    );

    return await this.executeTransaction([clause]);
  }

  /**
   * Approve verification request
   */
  async approveVerificationRequest(params: ApproveVerificationRequestParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'tokenURI', type: 'string' }
      ],
      name: 'approveVerificationRequest',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.requestId, params.tokenURI);
    return await this.executeTransaction([clause]);
  }

  /**
   * Reject verification request
   */
  async rejectVerificationRequest(params: RejectVerificationRequestParams): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'reason', type: 'string' }
      ],
      name: 'rejectVerificationRequest',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(params.requestId, params.reason);
    return await this.executeTransaction([clause]);
  }

  /**
   * Record gas sponsored
   */
  async recordGasSponsored(
    requestId: number,
    gasUsed: number,
    gasPrice: string
  ): Promise<string> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: false,
      inputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'gasUsed', type: 'uint256' },
        { name: 'gasPrice', type: 'uint256' }
      ],
      name: 'recordGasSponsored',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    });

    const clause = method.asClause(requestId, gasUsed, gasPrice);
    return await this.executeTransaction([clause]);
  }

  /**
   * Get verification request
   */
  async getVerificationRequest(requestId: number) {
    return await this.sdk.getVerificationRequest(requestId);
  }

  /**
   * Get total verification requests
   */
  async getTotalVerificationRequests(): Promise<number> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [],
      name: 'getTotalVerificationRequests',
      outputs: [{ name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call();
    return parseInt(result[0].toString());
  }

  /**
   * Get verification requests by stage
   */
  async getVerificationRequestsByStage(stage: number): Promise<number[]> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'stage', type: 'uint8' }],
      name: 'getVerificationRequestsByStage',
      outputs: [{ name: '', type: 'uint256[]' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(stage);
    return result[0].map((id: any) => parseInt(id.toString()));
  }

  /**
   * Get verification requests by verifier
   */
  async getVerificationRequestsByVerifier(verifierAddress: string): Promise<number[]> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'verifierAddress', type: 'address' }],
      name: 'getVerificationRequestsByVerifier',
      outputs: [{ name: '', type: 'uint256[]' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(verifierAddress);
    return result[0].map((id: any) => parseInt(id.toString()));
  }

  /**
   * Get verification requests by submitter
   */
  async getVerificationRequestsBySubmitter(submitterAddress: string): Promise<number[]> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [{ name: 'submitterAddress', type: 'address' }],
      name: 'getVerificationRequestsBySubmitter',
      outputs: [{ name: '', type: 'uint256[]' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(submitterAddress);
    return result[0].map((id: any) => parseInt(id.toString()));
  }

  /**
   * Get pending verification requests
   */
  async getPendingVerificationRequests(): Promise<number[]> {
    return await this.getVerificationRequestsByStage(0); // 0 = Submitted
  }

  /**
   * Get approved verification requests
   */
  async getApprovedVerificationRequests(): Promise<number[]> {
    return await this.getVerificationRequestsByStage(4); // 4 = Approved
  }

  /**
   * Get rejected verification requests
   */
  async getRejectedVerificationRequests(): Promise<number[]> {
    return await this.getVerificationRequestsByStage(5); // 5 = Rejected
  }

  /**
   * Get verification requests in technical review
   */
  async getTechnicalReviewRequests(): Promise<number[]> {
    return await this.getVerificationRequestsByStage(1); // 1 = TechnicalReview
  }

  /**
   * Get verification requests in field verification
   */
  async getFieldVerificationRequests(): Promise<number[]> {
    return await this.getVerificationRequestsByStage(2); // 2 = FieldVerification
  }

  /**
   * Get verification requests in final review
   */
  async getFinalReviewRequests(): Promise<number[]> {
    return await this.getVerificationRequestsByStage(3); // 3 = FinalReview
  }

  /**
   * Check if verifier is assigned to request
   */
  async isVerifierAssigned(requestId: number, verifierAddress: string): Promise<boolean> {
    const method = this.sdk['config'].connex.thor.account(this.contractAddress).method({
      constant: true,
      inputs: [
        { name: 'requestId', type: 'uint256' },
        { name: 'verifierAddress', type: 'address' }
      ],
      name: 'isVerifierAssigned',
      outputs: [{ name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    });

    const result = await method.call(requestId, verifierAddress);
    return result[0];
  }

  /**
   * Get verification statistics
   */
  async getVerificationStatistics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    technicalReviewRequests: number;
    fieldVerificationRequests: number;
    finalReviewRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalCarbonCredits: string;
    averageProcessingTime: number;
  }> {
    const total = await this.getTotalVerificationRequests();
    const pending = await this.getPendingVerificationRequests();
    const technicalReview = await this.getTechnicalReviewRequests();
    const fieldVerification = await this.getFieldVerificationRequests();
    const finalReview = await this.getFinalReviewRequests();
    const approved = await this.getApprovedVerificationRequests();
    const rejected = await this.getRejectedVerificationRequests();

    // Calculate total carbon credits
    let totalCarbonCredits = BigInt(0);
    const allRequestIds = await this.getAllRequestIds();
    
    for (const requestId of allRequestIds) {
      try {
        const request = await this.getVerificationRequest(requestId);
        totalCarbonCredits += BigInt(request.carbonAmount);
      } catch (error) {
        // Request doesn't exist or error occurred
        continue;
      }
    }

    // Calculate average processing time (simplified)
    const averageProcessingTime = 0; // This would require more complex logic

    return {
      totalRequests: total,
      pendingRequests: pending.length,
      technicalReviewRequests: technicalReview.length,
      fieldVerificationRequests: fieldVerification.length,
      finalReviewRequests: finalReview.length,
      approvedRequests: approved.length,
      rejectedRequests: rejected.length,
      totalCarbonCredits: totalCarbonCredits.toString(),
      averageProcessingTime
    };
  }

  /**
   * Get all request IDs
   */
  private async getAllRequestIds(): Promise<number[]> {
    const total = await this.getTotalVerificationRequests();
    const requestIds: number[] = [];
    
    for (let i = 1; i <= total; i++) {
      try {
        const request = await this.getVerificationRequest(i);
        if (request.requestId > 0) {
          requestIds.push(i);
        }
      } catch (error) {
        // Request doesn't exist
        continue;
      }
    }
    
    return requestIds;
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
      const gasLimit = 400000; // Default gas limit for verifier operations
      
      return await feeDelegation.signAndSendWithDelegation(
        { clauses },
        wallet,
        gasLimit
      );
    } else {
      // Regular transaction
      const tx = {
        clauses,
        gas: 400000,
        gasPrice: '0x0'
      };

      const signedTx = await wallet.signTransaction(tx);
      const result = await this.sdk['config'].connex.thor.transaction(signedTx).send();
      return result.txid;
    }
  }
}

export default CarbonCreditVerifierModule;
