# VeChain Key Management Guide

## Overview

VeChain uses a different key management system compared to Ethereum. This guide explains how to properly configure your development environment for VeChain.

## VeChain Key System

VeChain wallets use:
- **Public Key** (derived from private key)
- **Mnemonic Phrase** (to derive the private key)
- **No direct private key exposure** (for security in production)

## Development Setup Options

### Option 1: Use Private Keys (Recommended for Development)

For development and testing, you can still use private keys:

#### Getting Private Key from VeWorld

1. **Open VeWorld Wallet**
2. **Go to Settings → Security → Export Private Key**
3. **Copy the private key** (starts with `0x`)
4. **Add to .env file**:

```bash
# .env file
PRIVATE_KEY_TESTNET=0x1234567890abcdef...
PRIVATE_KEY_MAINNET=0x1234567890abcdef...
```

#### Getting Private Key from VeChainThor Wallet

1. **Open VeChainThor Wallet**
2. **Go to Settings → Export Private Key**
3. **Enter your password**
4. **Copy the private key**

### Option 2: Use Mnemonic Phrases (Alternative)

If you prefer using mnemonic phrases, the Hardhat config now supports both:

```bash
# .env file
MNEMONIC_TESTNET=your testnet mnemonic phrase here with spaces between words
MNEMONIC_MAINNET=your mainnet mnemonic phrase here with spaces between words
```

The Hardhat config will automatically derive the private key from the mnemonic.

### Option 3: Use VeWorld Integration (Production)

For production applications, use the VeWorld wallet integration:

```typescript
import { VeWorldWallet } from './src/sdk';

const wallet = new VeWorldWallet({
  network: 'testnet',
  connex
});

// Connect to VeWorld (no private key needed)
await wallet.connect();
```

## Configuration Examples

### Development Environment (.env)

```bash
# Option 1: Private Keys
PRIVATE_KEY_TESTNET=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
PRIVATE_KEY_MAINNET=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

# Option 2: Mnemonic Phrases
MNEMONIC_TESTNET=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
MNEMONIC_MAINNET=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about

# IPFS Configuration
IPFS_API_KEY=your_ipfs_api_key_here

# Network Selection
VECHAIN_NETWORK=testnet
```

### Hardhat Configuration

The updated `hardhat.config.ts` supports both private keys and mnemonic phrases:

```typescript
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

// Helper function to derive private key from mnemonic
function getPrivateKeyFromMnemonic(mnemonic: string, index: number = 0): string {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return wallet.privateKey;
}

const config: HardhatUserConfig = {
  networks: {
    vechain_testnet: {
      url: 'https://testnet.vechain.org',
      accounts: process.env.PRIVATE_KEY_TESTNET 
        ? [process.env.PRIVATE_KEY_TESTNET]
        : process.env.MNEMONIC_TESTNET 
          ? [getPrivateKeyFromMnemonic(process.env.MNEMONIC_TESTNET)]
          : [],
      gasPayerServiceUrl: 'https://sponsor-testnet.vechain.energy/by/269',
    },
    vechain_mainnet: {
      url: 'https://mainnet.vechain.org',
      accounts: process.env.PRIVATE_KEY_MAINNET 
        ? [process.env.PRIVATE_KEY_MAINNET]
        : process.env.MNEMONIC_MAINNET 
          ? [getPrivateKeyFromMnemonic(process.env.MNEMONIC_MAINNET)]
          : [],
    },
  }
};
```

## Security Considerations

### Development vs Production

#### Development
- ✅ **Use private keys** for testing and development
- ✅ **Use testnet** for all development work
- ✅ **Keep private keys in .env** (never commit to git)

#### Production
- ❌ **Never use private keys** in production
- ✅ **Use VeWorld wallet integration** for user interactions
- ✅ **Use hardware wallets** for admin operations
- ✅ **Use multi-signature wallets** for critical operations

### Best Practices

1. **Never commit private keys to git**
2. **Use .env files** for local development
3. **Use environment variables** in production
4. **Rotate keys regularly**
5. **Use different keys** for testnet and mainnet
6. **Keep mnemonic phrases secure**

## Testing Your Configuration

### Test Private Key Setup

```bash
# Test deployment with private key
npm run deploy:testnet
```

### Test Mnemonic Setup

```bash
# Test deployment with mnemonic
MNEMONIC_TESTNET="your mnemonic phrase here" npm run deploy:testnet
```

### Test VeWorld Integration

```typescript
// Test VeWorld connection
import { VeWorldWallet } from './src/sdk';

const wallet = new VeWorldWallet({
  network: 'testnet',
  connex
});

try {
  await wallet.connect();
  console.log('✅ VeWorld connected successfully');
  console.log('Address:', wallet.getConnectionStatus().address);
} catch (error) {
  console.error('❌ VeWorld connection failed:', error);
}
```

## Troubleshooting

### Common Issues

#### 1. "Invalid private key" Error
```
Error: invalid private key
```
**Solution**: Ensure your private key starts with `0x` and is 64 characters long.

#### 2. "Invalid mnemonic" Error
```
Error: invalid mnemonic
```
**Solution**: Ensure your mnemonic phrase has exactly 12 or 24 words.

#### 3. "Insufficient balance" Error
```
Error: insufficient balance
```
**Solution**: 
- For testnet: Get test VET from [VeChain Faucet](https://faucet.vecha.in/)
- For mainnet: Ensure you have sufficient VET and VTHO

#### 4. "Network mismatch" Error
```
Error: network mismatch
```
**Solution**: Ensure you're using the correct network configuration.

### Getting Test VET

1. **Visit VeChain Faucet**: https://faucet.vecha.in/
2. **Enter your testnet address**
3. **Request test VET**
4. **Wait for confirmation**

### Getting Test VTHO

VTHO is automatically generated by holding VET. You can also:
1. **Use VeChain Energy Service**: https://energy.vechain.org/
2. **Buy VTHO from exchanges**
3. **Use fee delegation** (configured in Hardhat)

## Migration Guide

### From Ethereum to VeChain

If you're coming from Ethereum development:

1. **Replace Web3.js/Ethers.js** with VeChain SDK
2. **Update network configurations**
3. **Use VeChain-specific features** (fee delegation, etc.)
4. **Update wallet integration** to use VeWorld

### From Other VeChain Projects

1. **Update to latest VeChain SDK**
2. **Use new Hardhat plugin**
3. **Update contract configurations**
4. **Test with new network settings**

## Resources

- [VeChain Documentation](https://docs.vechain.org/)
- [VeWorld Wallet](https://www.veworld.net/)
- [VeChain Faucet](https://faucet.vecha.in/)
- [VeChain Energy Service](https://energy.vechain.org/)
- [VeChain Explorer](https://explore.vechain.org/)

## Support

For additional help:
- [VeChain Discord](https://discord.gg/vechain)
- [VeChain GitHub](https://github.com/vechain)
- [VeChain Forum](https://forum.vechain.org/)
