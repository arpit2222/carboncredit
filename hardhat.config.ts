import '@vechain/sdk-hardhat-plugin';
import '@nomicfoundation/hardhat-toolbox';
import { HardhatUserConfig } from 'hardhat/config';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// Helper function to derive private key from mnemonic
function getPrivateKeyFromMnemonic(mnemonic: string, index: number = 0): string {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return wallet.privateKey;
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'paris', // VeChain's current EVM alignment
    },
  },
  networks: {
    // VeChain Testnet - for development and testing
    vechain_testnet: {
      url: 'https://testnet.vechain.org',
      accounts: process.env.PRIVATE_KEY_TESTNET 
        ? [process.env.PRIVATE_KEY_TESTNET]
        : process.env.MNEMONIC_TESTNET 
          ? [getPrivateKeyFromMnemonic(process.env.MNEMONIC_TESTNET)]
          : [],
      gasPayerServiceUrl: 'https://sponsor-testnet.vechain.energy/by/269', // Fee delegation for future phases
    },
    // VeChain Mainnet - for production deployment
    vechain_mainnet: {
      url: 'https://mainnet.vechain.org',
      accounts: process.env.PRIVATE_KEY_MAINNET 
        ? [process.env.PRIVATE_KEY_MAINNET]
        : process.env.MNEMONIC_MAINNET 
          ? [getPrivateKeyFromMnemonic(process.env.MNEMONIC_MAINNET)]
          : [],
    },
    // Thor Solo - local development network
    vechain_solo: {
      url: 'http://localhost:8669',
      accounts: [
        '0xbe862ad9abfe6f22bcb087716c7d89a26051f74c9c446a4f6eba0a9452e40983',
        '0x72894a175b02fee580c401c6bab0f4037d6bcb4da2241b2b5c63f998c65de66c',
        '0x8d5b2f9aa8dd4c3c1b5f3c5e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
        '0x9e6b3f0bb9ee5d4d2c6f4d6e9f0a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        '0xaf7c4f1cc0ff6e5e3d7f5e7f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
      ],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: 'typechain-types',
    target: 'ethers-v6',
  },
};

export default config;
