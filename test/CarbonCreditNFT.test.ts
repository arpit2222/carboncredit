import { expect } from 'chai';
import { ethers } from 'hardhat';
import { CarbonCreditNFT } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('CarbonCreditNFT', function () {
  let carbonCreditNFT: CarbonCreditNFT;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test constants
  const CARBON_AMOUNT = ethers.parseEther('1000'); // 1000 tonnes
  const LOCATION = '40.7128,-74.0060'; // NYC coordinates
  const IPFS_HASH = 'QmTestHash123456789';
  const TOKEN_URI = 'QmTestTokenURI123456789';

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();

    // Deploy fresh contract before each test
    const CarbonCreditNFTFactory = await ethers.getContractFactory('CarbonCreditNFT');
    carbonCreditNFT = await CarbonCreditNFTFactory.deploy(
      'VeChain Carbon Credit',
      'VCC',
      'ipfs://'
    );
    await carbonCreditNFT.waitForDeployment();

    // Grant MINTER_ROLE to minter address
    await carbonCreditNFT.grantRole(await carbonCreditNFT.MINTER_ROLE(), minter.address);
  });

  describe('Deployment', function () {
    it('Should set correct name and symbol', async function () {
      expect(await carbonCreditNFT.name()).to.equal('VeChain Carbon Credit');
      expect(await carbonCreditNFT.symbol()).to.equal('VCC');
    });

    it('Should set correct base URI', async function () {
      expect(await carbonCreditNFT.baseURI).to.equal('ipfs://');
    });

    it('Should grant all roles to deployer', async function () {
      const DEFAULT_ADMIN_ROLE = await carbonCreditNFT.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await carbonCreditNFT.MINTER_ROLE();
      const BURNER_ROLE = await carbonCreditNFT.BURNER_ROLE();

      expect(await carbonCreditNFT.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await carbonCreditNFT.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await carbonCreditNFT.hasRole(BURNER_ROLE, owner.address)).to.be.true;
    });

    it('Should start with zero total supply', async function () {
      expect(await carbonCreditNFT.totalSupply()).to.equal(0);
    });
  });

  describe('Minting', function () {
    it('Should mint carbon credit with correct metadata', async function () {
      const tx = await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0, // Reforestation
        IPFS_HASH,
        TOKEN_URI
      );

      const receipt = await tx.wait();
      const tokenId = 1;

      // Check token ownership
      expect(await carbonCreditNFT.ownerOf(tokenId)).to.equal(user1.address);

      // Check metadata
      const metadata = await carbonCreditNFT.getCreditMetadata(tokenId);
      expect(metadata.creditId).to.equal(tokenId);
      expect(metadata.carbonAmount).to.equal(CARBON_AMOUNT);
      expect(metadata.generatorAddress).to.equal(user1.address);
      expect(metadata.location).to.equal(LOCATION);
      expect(metadata.verificationStatus).to.equal(0); // Pending
      expect(metadata.generationDate).to.be.greaterThan(0);
      expect(metadata.expiryDate).to.equal(0);
      expect(metadata.projectType).to.equal(0); // Reforestation
      expect(metadata.proofsIPFSHash).to.equal(IPFS_HASH);

      // Check token URI
      expect(await carbonCreditNFT.tokenURI(tokenId)).to.equal('ipfs://' + TOKEN_URI);
    });

    it('Should increment token ID counter', async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );

      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user2.address,
        CARBON_AMOUNT,
        LOCATION,
        1, // RenewableEnergy
        IPFS_HASH,
        TOKEN_URI
      );

      expect(await carbonCreditNFT.totalSupply()).to.equal(2);
      expect(await carbonCreditNFT.ownerOf(1)).to.equal(user1.address);
      expect(await carbonCreditNFT.ownerOf(2)).to.equal(user2.address);
    });

    it('Should emit CarbonCreditMinted event', async function () {
      await expect(
        carbonCreditNFT.connect(minter).mintCarbonCredit(
          user1.address,
          CARBON_AMOUNT,
          LOCATION,
          0,
          IPFS_HASH,
          TOKEN_URI
        )
      )
        .to.emit(carbonCreditNFT, 'CarbonCreditMinted')
        .withArgs(1, user1.address, CARBON_AMOUNT, 0);
    });

    it('Should set initial verification status to Pending', async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );

      const status = await carbonCreditNFT.getVerificationStatus(1);
      expect(status).to.equal(0); // Pending
    });

    it('Should revert if caller doesn\'t have MINTER_ROLE', async function () {
      await expect(
        carbonCreditNFT.connect(user1).mintCarbonCredit(
          user1.address,
          CARBON_AMOUNT,
          LOCATION,
          0,
          IPFS_HASH,
          TOKEN_URI
        )
      ).to.be.revertedWith('AccessControl: account');
    });

    it('Should revert if minting to zero address', async function () {
      await expect(
        carbonCreditNFT.connect(minter).mintCarbonCredit(
          ethers.ZeroAddress,
          CARBON_AMOUNT,
          LOCATION,
          0,
          IPFS_HASH,
          TOKEN_URI
        )
      ).to.be.revertedWith('CarbonCreditNFT: mint to zero address');
    });

    it('Should revert if carbon amount is zero', async function () {
      await expect(
        carbonCreditNFT.connect(minter).mintCarbonCredit(
          user1.address,
          0,
          LOCATION,
          0,
          IPFS_HASH,
          TOKEN_URI
        )
      ).to.be.revertedWith('CarbonCreditNFT: carbon amount must be positive');
    });

    it('Should revert if location is empty', async function () {
      await expect(
        carbonCreditNFT.connect(minter).mintCarbonCredit(
          user1.address,
          CARBON_AMOUNT,
          '',
          0,
          IPFS_HASH,
          TOKEN_URI
        )
      ).to.be.revertedWith('CarbonCreditNFT: location cannot be empty');
    });

    it('Should revert if IPFS hash is empty', async function () {
      await expect(
        carbonCreditNFT.connect(minter).mintCarbonCredit(
          user1.address,
          CARBON_AMOUNT,
          LOCATION,
          0,
          '',
          TOKEN_URI
        )
      ).to.be.revertedWith('CarbonCreditNFT: IPFS hash cannot be empty');
    });
  });

  describe('Metadata Getters', function () {
    beforeEach(async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );
    });

    it('Should return correct full metadata struct', async function () {
      const metadata = await carbonCreditNFT.getCreditMetadata(1);
      expect(metadata.creditId).to.equal(1);
      expect(metadata.carbonAmount).to.equal(CARBON_AMOUNT);
      expect(metadata.generatorAddress).to.equal(user1.address);
      expect(metadata.location).to.equal(LOCATION);
      expect(metadata.verificationStatus).to.equal(0);
      expect(metadata.projectType).to.equal(0);
      expect(metadata.proofsIPFSHash).to.equal(IPFS_HASH);
    });

    it('Should return correct carbon amount', async function () {
      expect(await carbonCreditNFT.getCarbonAmount(1)).to.equal(CARBON_AMOUNT);
    });

    it('Should return correct generator address', async function () {
      expect(await carbonCreditNFT.getGeneratorAddress(1)).to.equal(user1.address);
    });

    it('Should return correct verification status', async function () {
      expect(await carbonCreditNFT.getVerificationStatus(1)).to.equal(0);
    });

    it('Should return correct project type', async function () {
      expect(await carbonCreditNFT.getProjectType(1)).to.equal(0);
    });

    it('Should revert for non-existent token ID', async function () {
      await expect(carbonCreditNFT.getCreditMetadata(999))
        .to.be.revertedWith('CarbonCreditNFT: token does not exist');
    });
  });

  describe('Verification Status Update', function () {
    beforeEach(async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );
    });

    it('Should update status from Pending to Verified', async function () {
      await expect(
        carbonCreditNFT.connect(minter).updateVerificationStatus(1, 1) // Verified
      )
        .to.emit(carbonCreditNFT, 'VerificationStatusUpdated')
        .withArgs(1, 0, 1); // tokenId, oldStatus (Pending), newStatus (Verified)

      expect(await carbonCreditNFT.getVerificationStatus(1)).to.equal(1);
    });

    it('Should allow status change to Rejected', async function () {
      await carbonCreditNFT.connect(minter).updateVerificationStatus(1, 2); // Rejected
      expect(await carbonCreditNFT.getVerificationStatus(1)).to.equal(2);
    });

    it('Should revert if caller doesn\'t have MINTER_ROLE', async function () {
      await expect(
        carbonCreditNFT.connect(user1).updateVerificationStatus(1, 1)
      ).to.be.revertedWith('AccessControl: account');
    });

    it('Should revert for non-existent token', async function () {
      await expect(
        carbonCreditNFT.connect(minter).updateVerificationStatus(999, 1)
      ).to.be.revertedWith('CarbonCreditNFT: token does not exist');
    });
  });

  describe('Burn', function () {
    beforeEach(async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );
    });

    it('Should allow owner to burn their token', async function () {
      await expect(
        carbonCreditNFT.connect(user1).burnCarbonCredit(1)
      )
        .to.emit(carbonCreditNFT, 'CarbonCreditBurned')
        .withArgs(1, user1.address, CARBON_AMOUNT);

      await expect(carbonCreditNFT.ownerOf(1)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('Should allow BURNER_ROLE to burn any token', async function () {
      await expect(
        carbonCreditNFT.connect(owner).burnCarbonCredit(1)
      )
        .to.emit(carbonCreditNFT, 'CarbonCreditBurned')
        .withArgs(1, owner.address, CARBON_AMOUNT);
    });

    it('Should delete metadata after burn', async function () {
      await carbonCreditNFT.connect(user1).burnCarbonCredit(1);
      
      await expect(carbonCreditNFT.getCreditMetadata(1))
        .to.be.revertedWith('CarbonCreditNFT: token does not exist');
    });

    it('Should revert if caller is not owner and doesn\'t have BURNER_ROLE', async function () {
      await expect(
        carbonCreditNFT.connect(user2).burnCarbonCredit(1)
      ).to.be.revertedWith('CarbonCreditNFT: caller is not owner or burner');
    });

    it('Should revert for non-existent token', async function () {
      await expect(
        carbonCreditNFT.connect(user1).burnCarbonCredit(999)
      ).to.be.revertedWith('CarbonCreditNFT: token does not exist');
    });
  });

  describe('Retire', function () {
    beforeEach(async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );
      // Verify the credit first
      await carbonCreditNFT.connect(minter).updateVerificationStatus(1, 1); // Verified
    });

    it('Should allow owner to retire their credit', async function () {
      await expect(
        carbonCreditNFT.connect(user1).retireCarbonCredit(1)
      )
        .to.emit(carbonCreditNFT, 'CarbonCreditRetired')
        .withArgs(1, user1.address, CARBON_AMOUNT);

      expect(await carbonCreditNFT.getVerificationStatus(1)).to.equal(3); // Retired
    });

    it('Should update status to Retired', async function () {
      await carbonCreditNFT.connect(user1).retireCarbonCredit(1);
      expect(await carbonCreditNFT.getVerificationStatus(1)).to.equal(3);
    });

    it('Should emit CarbonCreditRetired event', async function () {
      await expect(
        carbonCreditNFT.connect(user1).retireCarbonCredit(1)
      )
        .to.emit(carbonCreditNFT, 'CarbonCreditRetired')
        .withArgs(1, user1.address, CARBON_AMOUNT);
    });

    it('Should NOT burn the token', async function () {
      await carbonCreditNFT.connect(user1).retireCarbonCredit(1);
      expect(await carbonCreditNFT.ownerOf(1)).to.equal(user1.address);
    });

    it('Should revert if caller is not owner', async function () {
      await expect(
        carbonCreditNFT.connect(user2).retireCarbonCredit(1)
      ).to.be.revertedWith('CarbonCreditNFT: caller is not owner');
    });

    it('Should revert if credit is not verified', async function () {
      // Mint another credit but don't verify it
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );

      await expect(
        carbonCreditNFT.connect(user1).retireCarbonCredit(2)
      ).to.be.revertedWith('CarbonCreditNFT: only verified credits can be retired');
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant MINTER_ROLE', async function () {
      await carbonCreditNFT.grantRole(await carbonCreditNFT.MINTER_ROLE(), user1.address);
      expect(await carbonCreditNFT.hasRole(await carbonCreditNFT.MINTER_ROLE(), user1.address)).to.be.true;
    });

    it('Should allow admin to revoke MINTER_ROLE', async function () {
      await carbonCreditNFT.revokeRole(await carbonCreditNFT.MINTER_ROLE(), minter.address);
      expect(await carbonCreditNFT.hasRole(await carbonCreditNFT.MINTER_ROLE(), minter.address)).to.be.false;
    });

    it('Should allow admin to grant BURNER_ROLE', async function () {
      await carbonCreditNFT.grantRole(await carbonCreditNFT.BURNER_ROLE(), user1.address);
      expect(await carbonCreditNFT.hasRole(await carbonCreditNFT.BURNER_ROLE(), user1.address)).to.be.true;
    });

    it('Should revert if non-admin tries to grant roles', async function () {
      await expect(
        carbonCreditNFT.connect(user1).grantRole(await carbonCreditNFT.MINTER_ROLE(), user2.address)
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('Base URI', function () {
    it('Should return correct token URI with base URI', async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );

      expect(await carbonCreditNFT.tokenURI(1)).to.equal('ipfs://' + TOKEN_URI);
    });

    it('Should allow admin to update base URI', async function () {
      await carbonCreditNFT.setBaseURI('https://api.example.com/');
      expect(await carbonCreditNFT.baseURI).to.equal('https://api.example.com/');
    });

    it('Should revert if non-admin tries to update base URI', async function () {
      await expect(
        carbonCreditNFT.connect(user1).setBaseURI('https://api.example.com/')
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('ERC721 Standard Compliance', function () {
    beforeEach(async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );
    });

    it('Should support ERC721 interface', async function () {
      expect(await carbonCreditNFT.supportsInterface('0x80ac58cd')).to.be.true; // ERC721
    });

    it('Should support ERC721Metadata interface', async function () {
      expect(await carbonCreditNFT.supportsInterface('0x5b5e139f')).to.be.true; // ERC721Metadata
    });

    it('Should support AccessControl interface', async function () {
      expect(await carbonCreditNFT.supportsInterface('0x7965db0b')).to.be.true; // AccessControl
    });

    it('Should allow safe transfers', async function () {
      await carbonCreditNFT.connect(user1).safeTransferFrom(user1.address, user2.address, 1);
      expect(await carbonCreditNFT.ownerOf(1)).to.equal(user2.address);
    });

    it('Should allow approvals', async function () {
      await carbonCreditNFT.connect(user1).approve(user2.address, 1);
      expect(await carbonCreditNFT.getApproved(1)).to.equal(user2.address);
    });
  });

  describe('Edge Cases', function () {
    it('Should handle all ProjectType enum values', async function () {
      for (let i = 0; i < 5; i++) {
        await carbonCreditNFT.connect(minter).mintCarbonCredit(
          user1.address,
          CARBON_AMOUNT,
          LOCATION,
          i,
          IPFS_HASH,
          TOKEN_URI
        );
        expect(await carbonCreditNFT.getProjectType(i + 1)).to.equal(i);
      }
    });

    it('Should handle expiry date of 0 (no expiry)', async function () {
      await carbonCreditNFT.connect(minter).mintCarbonCredit(
        user1.address,
        CARBON_AMOUNT,
        LOCATION,
        0,
        IPFS_HASH,
        TOKEN_URI
      );

      const metadata = await carbonCreditNFT.getCreditMetadata(1);
      expect(metadata.expiryDate).to.equal(0);
    });

    it('Should handle empty location string validation', async function () {
      await expect(
        carbonCreditNFT.connect(minter).mintCarbonCredit(
          user1.address,
          CARBON_AMOUNT,
          '',
          0,
          IPFS_HASH,
          TOKEN_URI
        )
      ).to.be.revertedWith('CarbonCreditNFT: location cannot be empty');
    });
  });
});
