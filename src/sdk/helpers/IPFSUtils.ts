import axios from 'axios';
import FormData from 'form-data';

/**
 * IPFS Utilities
 * Handles file uploads to IPFS using Pinata or Web3.Storage
 */

export interface IPFSConfig {
  pinataApiKey?: string;
  pinataSecretKey?: string;
  web3StorageToken?: string;
}

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

export class IPFSUtils {
  private provider: 'pinata' | 'web3storage';
  private config: IPFSConfig;

  constructor(provider: 'pinata' | 'web3storage' = 'pinata', config: IPFSConfig = {}) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(file: File | string): Promise<string> {
    if (this.provider === 'pinata') {
      return await this.uploadToPinata(file);
    } else if (this.provider === 'web3storage') {
      return await this.uploadToWeb3Storage(file);
    } else {
      throw new Error('Unsupported IPFS provider');
    }
  }

  /**
   * Upload JSON object to IPFS
   */
  async uploadJSON(data: any): Promise<string> {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });
    
    return await this.uploadFile(file);
  }

  /**
   * Upload image to IPFS
   */
  async uploadImage(imageFile: File): Promise<string> {
    // Validate image file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    return await this.uploadFile(imageFile);
  }

  /**
   * Upload document to IPFS
   */
  async uploadDocument(documentFile: File): Promise<string> {
    // Validate document file
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(documentFile.type)) {
      throw new Error('Unsupported document type');
    }

    return await this.uploadFile(documentFile);
  }

  /**
   * Upload multiple files to IPFS
   */
  async uploadMultipleFiles(files: File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  /**
   * Get IPFS URL from hash
   */
  getIPFSUrl(hash: string): string {
    if (this.provider === 'pinata') {
      return `https://gateway.pinata.cloud/ipfs/${hash}`;
    } else if (this.provider === 'web3storage') {
      return `https://${hash}.ipfs.w3s.link`;
    } else {
      return `https://ipfs.io/ipfs/${hash}`;
    }
  }

  /**
   * Upload to Pinata
   */
  private async uploadToPinata(file: File | string): Promise<string> {
    if (!this.config.pinataApiKey || !this.config.pinataSecretKey) {
      throw new Error('Pinata API credentials not configured');
    }

    try {
      const formData = new FormData();
      
      if (typeof file === 'string') {
        // If file is a string, treat it as a file path or URL
        // For now, we'll assume it's a file path and read it
        throw new Error('String file upload not implemented yet');
      } else {
        formData.append('file', file);
      }

      // Add metadata
      formData.append('pinataMetadata', JSON.stringify({
        name: file instanceof File ? file.name : 'uploaded-file',
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          provider: 'carbon-credit-sdk'
        }
      }));

      // Add options
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }));

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': this.config.pinataApiKey,
            'pinata_secret_api_key': this.config.pinataSecretKey
          }
        }
      );

      return response.data.IpfsHash;
    } catch (error) {
      console.error('Pinata upload error:', error);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  /**
   * Upload to Web3.Storage
   */
  private async uploadToWeb3Storage(file: File | string): Promise<string> {
    if (!this.config.web3StorageToken) {
      throw new Error('Web3.Storage token not configured');
    }

    try {
      if (typeof file === 'string') {
        // If file is a string, treat it as a file path or URL
        // For now, we'll assume it's a file path and read it
        throw new Error('String file upload not implemented yet');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.web3.storage/upload',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.web3StorageToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.cid;
    } catch (error) {
      console.error('Web3.Storage upload error:', error);
      throw new Error(`Failed to upload to Web3.Storage: ${error.message}`);
    }
  }

  /**
   * Validate IPFS hash
   */
  static validateIPFSHash(hash: string): boolean {
    // Basic validation for IPFS hash format
    const ipfsHashRegex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    return ipfsHashRegex.test(hash);
  }

  /**
   * Extract hash from IPFS URL
   */
  static extractHashFromUrl(url: string): string | null {
    const patterns = [
      /\/ipfs\/([a-zA-Z0-9]+)/,
      /^([a-zA-Z0-9]+)\.ipfs\.w3s\.link$/,
      /^([a-zA-Z0-9]+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Get file size from IPFS
   */
  async getFileSize(hash: string): Promise<number> {
    try {
      const url = this.getIPFSUrl(hash);
      const response = await axios.head(url);
      return parseInt(response.headers['content-length'] || '0');
    } catch (error) {
      console.error('Failed to get file size:', error);
      return 0;
    }
  }

  /**
   * Check if file exists on IPFS
   */
  async fileExists(hash: string): Promise<boolean> {
    try {
      const url = this.getIPFSUrl(hash);
      await axios.head(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Download file from IPFS
   */
  async downloadFile(hash: string): Promise<Blob> {
    try {
      const url = this.getIPFSUrl(hash);
      const response = await axios.get(url, { responseType: 'blob' });
      return response.data;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw new Error(`Failed to download file from IPFS: ${error.message}`);
    }
  }

  /**
   * Get file metadata from IPFS
   */
  async getFileMetadata(hash: string): Promise<{
    size: number;
    type: string;
    lastModified: Date;
  }> {
    try {
      const url = this.getIPFSUrl(hash);
      const response = await axios.head(url);
      
      return {
        size: parseInt(response.headers['content-length'] || '0'),
        type: response.headers['content-type'] || 'application/octet-stream',
        lastModified: new Date(response.headers['last-modified'] || Date.now())
      };
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }

  /**
   * Create carbon credit metadata JSON
   */
  static createCarbonCreditMetadata(params: {
    name: string;
    description: string;
    image: string;
    carbonAmount: string;
    location: string;
    projectType: string;
    verificationStatus: string;
    generationDate: string;
    expiryDate?: string;
    proofsIPFSHash: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  }): any {
    return {
      name: params.name,
      description: params.description,
      image: params.image,
      external_url: `https://carbon-credit.vechain.org/token/${params.name}`,
      attributes: [
        {
          trait_type: 'Carbon Amount',
          value: params.carbonAmount
        },
        {
          trait_type: 'Location',
          value: params.location
        },
        {
          trait_type: 'Project Type',
          value: params.projectType
        },
        {
          trait_type: 'Verification Status',
          value: params.verificationStatus
        },
        {
          trait_type: 'Generation Date',
          value: params.generationDate
        },
        ...(params.expiryDate ? [{
          trait_type: 'Expiry Date',
          value: params.expiryDate
        }] : []),
        {
          trait_type: 'Proofs Hash',
          value: params.proofsIPFSHash
        },
        ...(params.attributes || [])
      ],
      properties: {
        carbonAmount: params.carbonAmount,
        location: params.location,
        projectType: params.projectType,
        verificationStatus: params.verificationStatus,
        generationDate: params.generationDate,
        expiryDate: params.expiryDate,
        proofsIPFSHash: params.proofsIPFSHash
      }
    };
  }

  /**
   * Create organization metadata JSON
   */
  static createOrganizationMetadata(params: {
    name: string;
    description: string;
    website?: string;
    contactInfo?: string;
    kycDocumentsHash: string;
  }): any {
    return {
      name: params.name,
      description: params.description,
      website: params.website,
      contactInfo: params.contactInfo,
      kycDocumentsHash: params.kycDocumentsHash,
      type: 'organization',
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Create farmer metadata JSON
   */
  static createFarmerMetadata(params: {
    name: string;
    location: string;
    landSize: string;
    description?: string;
    contactInfo?: string;
    verificationDocumentsHash: string;
  }): any {
    return {
      name: params.name,
      location: params.location,
      landSize: params.landSize,
      description: params.description,
      contactInfo: params.contactInfo,
      verificationDocumentsHash: params.verificationDocumentsHash,
      type: 'farmer',
      createdAt: new Date().toISOString()
    };
  }
}

export default IPFSUtils;
