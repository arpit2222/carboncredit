import { expect } from 'chai';
import { ethers } from 'hardhat';
import { FarmerRegistry } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('FarmerRegistry', function () {
  let farmerRegistry: FarmerRegistry;
  let admin: SignerWithAddress;
  let verifier: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test constants
  const FARMER_NAME = 'John Doe';
  const FARMER_NAME_2 = 'Jane Smith';
  const LOCATION = '40.7128,-74.0060'; // NYC coordinates
  const LOCATION_2 = '34.0522,-118.2437'; // LA coordinates
  const LAND_SIZE = ethers.parseEther('100'); // 100 hectares
  const LAND_SIZE_2 = ethers.parseEther('50'); // 50 hectares
  const VERIFICATION_HASH = 'QmVerificationHash123456789';
  const VERIFICATION_HASH_2 = 'QmVerificationHash987654321';

  beforeEach(async function () {
    [admin, verifier, user1, user2] = await ethers.getSigners();

    // Deploy fresh contract before each test
    const FarmerRegistryFactory = await ethers.getContractFactory('FarmerRegistry');
    farmerRegistry = await FarmerRegistryFactory.deploy();
    await farmerRegistry.waitForDeployment();

    // Grant VERIFIER_ROLE to verifier address
    await farmerRegistry.grantRole(await farmerRegistry.VERIFIER_ROLE(), verifier.address);
  });

  describe('Deployment', function () {
    it('Should grant admin role to deployer', async function () {
      expect(await farmerRegistry.hasRole(await farmerRegistry.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it('Should grant verifier role to deployer', async function () {
      expect(await farmerRegistry.hasRole(await farmerRegistry.VERIFIER_ROLE(), admin.address)).to.be.true;
    });

    it('Should start with zero total farmers', async function () {
      expect(await farmerRegistry.getTotalFarmers()).to.equal(0);
    });
  });

  describe('Farmer Registration', function () {
    it('Should register farmer with correct data', async function () {
      const tx = await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0, // No associated organization
        VERIFICATION_HASH
      );

      const receipt = await tx.wait();
      const farmerId = 1;

      // Check farmer data
      const farmer = await farmerRegistry.getFarmer(farmerId);
      expect(farmer.farmerId).to.equal(farmerId);
      expect(farmer.name).to.equal(FARMER_NAME);
      expect(farmer.location).to.equal(LOCATION);
      expect(farmer.walletAddress).to.equal(user1.address);
      expect(farmer.landSize).to.equal(LAND_SIZE);
      expect(farmer.associatedOrg).to.equal(0);
      expect(farmer.verificationDocumentsHash).to.equal(VERIFICATION_HASH);
      expect(farmer.verificationStatus).to.equal(0); // Pending
      expect(farmer.registrationDate).to.be.greaterThan(0);
      expect(farmer.lastUpdated).to.be.greaterThan(0);
      expect(farmer.isActive).to.be.true;

      // Check mappings
      expect(await farmerRegistry.getFarmerIdByAddress(user1.address)).to.equal(farmerId);
      expect(await farmerRegistry.isAddressRegistered(user1.address)).to.be.true;
    });

    it('Should register farmer with associated organization', async function () {
      const orgId = 123; // Mock organization ID

      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        orgId,
        VERIFICATION_HASH
      );

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.associatedOrg).to.equal(orgId);

      const orgFarmers = await farmerRegistry.getFarmersByOrganization(orgId);
      expect(orgFarmers.length).to.equal(1);
      expect(orgFarmers[0]).to.equal(1);
    });

    it('Should emit FarmerRegistered event', async function () {
      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          FARMER_NAME,
          LOCATION,
          user1.address,
          LAND_SIZE,
          0,
          VERIFICATION_HASH
        )
      )
        .to.emit(farmerRegistry, 'FarmerRegistered')
        .withArgs(1, user1.address, FARMER_NAME, LOCATION, LAND_SIZE, 0, VERIFICATION_HASH);
    });

    it('Should increment farmer counter', async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );

      await farmerRegistry.connect(user2).registerFarmer(
        FARMER_NAME_2,
        LOCATION_2,
        user2.address,
        LAND_SIZE_2,
        0,
        VERIFICATION_HASH_2
      );

      expect(await farmerRegistry.getTotalFarmers()).to.equal(2);
    });

    it('Should revert if wallet address is zero', async function () {
      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          FARMER_NAME,
          LOCATION,
          ethers.ZeroAddress,
          LAND_SIZE,
          0,
          VERIFICATION_HASH
        )
      ).to.be.revertedWith('FarmerRegistry: wallet address cannot be zero');
    });

    it('Should revert if name is empty', async function () {
      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          '',
          LOCATION,
          user1.address,
          LAND_SIZE,
          0,
          VERIFICATION_HASH
        )
      ).to.be.revertedWith('FarmerRegistry: name cannot be empty');
    });

    it('Should revert if location is empty', async function () {
      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          FARMER_NAME,
          '',
          user1.address,
          LAND_SIZE,
          0,
          VERIFICATION_HASH
        )
      ).to.be.revertedWith('FarmerRegistry: location cannot be empty');
    });

    it('Should revert if land size is zero', async function () {
      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          FARMER_NAME,
          LOCATION,
          user1.address,
          0,
          0,
          VERIFICATION_HASH
        )
      ).to.be.revertedWith('FarmerRegistry: land size must be positive');
    });

    it('Should revert if verification hash is empty', async function () {
      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          FARMER_NAME,
          LOCATION,
          user1.address,
          LAND_SIZE,
          0,
          ''
        )
      ).to.be.revertedWith('FarmerRegistry: verification documents hash cannot be empty');
    });

    it('Should revert if wallet address already registered', async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );

      await expect(
        farmerRegistry.connect(user1).registerFarmer(
          FARMER_NAME_2,
          LOCATION_2,
          user1.address,
          LAND_SIZE_2,
          0,
          VERIFICATION_HASH_2
        )
      ).to.be.revertedWith('FarmerRegistry: wallet address already registered');
    });
  });

  describe('Farmer Updates', function () {
    beforeEach(async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );
    });

    it('Should allow farmer to update their profile', async function () {
      await expect(
        farmerRegistry.connect(user1).updateFarmer(
          1,
          FARMER_NAME_2,
          LOCATION_2,
          LAND_SIZE_2
        )
      )
        .to.emit(farmerRegistry, 'FarmerUpdated')
        .withArgs(1, user1.address, FARMER_NAME_2, LOCATION_2, LAND_SIZE_2);

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.name).to.equal(FARMER_NAME_2);
      expect(farmer.location).to.equal(LOCATION_2);
      expect(farmer.landSize).to.equal(LAND_SIZE_2);
      expect(farmer.lastUpdated).to.be.greaterThan(farmer.registrationDate);
    });

    it('Should allow admin to update any farmer', async function () {
      await farmerRegistry.connect(admin).updateFarmer(
        1,
        FARMER_NAME_2,
        LOCATION_2,
        LAND_SIZE_2
      );

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.name).to.equal(FARMER_NAME_2);
    });

    it('Should revert if caller is not authorized', async function () {
      await expect(
        farmerRegistry.connect(user2).updateFarmer(
          1,
          FARMER_NAME_2,
          LOCATION_2,
          LAND_SIZE_2
        )
      ).to.be.revertedWith('FarmerRegistry: caller is not authorized to update this farmer');
    });

    it('Should revert if farmer does not exist', async function () {
      await expect(
        farmerRegistry.connect(user1).updateFarmer(
          999,
          FARMER_NAME_2,
          LOCATION_2,
          LAND_SIZE_2
        )
      ).to.be.revertedWith('FarmerRegistry: farmer does not exist');
    });

    it('Should revert if farmer is not active', async function () {
      await farmerRegistry.connect(admin).setFarmerStatus(1, false);

      await expect(
        farmerRegistry.connect(user1).updateFarmer(
          1,
          FARMER_NAME_2,
          LOCATION_2,
          LAND_SIZE_2
        )
      ).to.be.revertedWith('FarmerRegistry: farmer is not active');
    });

    it('Should revert if new name is empty', async function () {
      await expect(
        farmerRegistry.connect(user1).updateFarmer(
          1,
          '',
          LOCATION_2,
          LAND_SIZE_2
        )
      ).to.be.revertedWith('FarmerRegistry: name cannot be empty');
    });

    it('Should revert if new location is empty', async function () {
      await expect(
        farmerRegistry.connect(user1).updateFarmer(
          1,
          FARMER_NAME_2,
          '',
          LAND_SIZE_2
        )
      ).to.be.revertedWith('FarmerRegistry: location cannot be empty');
    });

    it('Should revert if new land size is zero', async function () {
      await expect(
        farmerRegistry.connect(user1).updateFarmer(
          1,
          FARMER_NAME_2,
          LOCATION_2,
          0
        )
      ).to.be.revertedWith('FarmerRegistry: land size must be positive');
    });
  });

  describe('Organization Association Updates', function () {
    beforeEach(async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );
    });

    it('Should allow farmer to update organization association', async function () {
      const newOrgId = 456;

      await expect(
        farmerRegistry.connect(user1).updateOrganizationAssociation(1, newOrgId)
      )
        .to.emit(farmerRegistry, 'OrganizationAssociationUpdated')
        .withArgs(1, 0, newOrgId);

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.associatedOrg).to.equal(newOrgId);

      const orgFarmers = await farmerRegistry.getFarmersByOrganization(newOrgId);
      expect(orgFarmers.length).to.equal(1);
      expect(orgFarmers[0]).to.equal(1);
    });

    it('Should allow farmer to remove organization association', async function () {
      // First associate with an organization
      await farmerRegistry.connect(user1).updateOrganizationAssociation(1, 123);

      // Then remove the association
      await farmerRegistry.connect(user1).updateOrganizationAssociation(1, 0);

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.associatedOrg).to.equal(0);

      const orgFarmers = await farmerRegistry.getFarmersByOrganization(123);
      expect(orgFarmers.length).to.equal(0);
    });

    it('Should allow admin to update organization association', async function () {
      const newOrgId = 789;

      await farmerRegistry.connect(admin).updateOrganizationAssociation(1, newOrgId);

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.associatedOrg).to.equal(newOrgId);
    });

    it('Should revert if caller is not authorized', async function () {
      await expect(
        farmerRegistry.connect(user2).updateOrganizationAssociation(1, 123)
      ).to.be.revertedWith('FarmerRegistry: caller is not authorized to update this farmer');
    });

    it('Should revert if farmer does not exist', async function () {
      await expect(
        farmerRegistry.connect(user1).updateOrganizationAssociation(999, 123)
      ).to.be.revertedWith('FarmerRegistry: farmer does not exist');
    });

    it('Should revert if farmer is not active', async function () {
      await farmerRegistry.connect(admin).setFarmerStatus(1, false);

      await expect(
        farmerRegistry.connect(user1).updateOrganizationAssociation(1, 123)
      ).to.be.revertedWith('FarmerRegistry: farmer is not active');
    });
  });

  describe('Farmer Verification', function () {
    beforeEach(async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );
    });

    it('Should allow verifier to verify farmer', async function () {
      await expect(
        farmerRegistry.connect(verifier).verifyFarmer(1, 1) // Verified
      )
        .to.emit(farmerRegistry, 'FarmerVerified')
        .withArgs(1, 0, 1); // farmerId, oldStatus (Pending), newStatus (Verified)

      expect(await farmerRegistry.getVerificationStatus(1)).to.equal(1);
      expect(await farmerRegistry.isFarmerVerified(1)).to.be.true;
    });

    it('Should allow verifier to reject farmer', async function () {
      await farmerRegistry.connect(verifier).verifyFarmer(1, 2); // Rejected
      expect(await farmerRegistry.getVerificationStatus(1)).to.equal(2);
      expect(await farmerRegistry.isFarmerVerified(1)).to.be.false;
    });

    it('Should allow verifier to suspend farmer', async function () {
      await farmerRegistry.connect(verifier).verifyFarmer(1, 3); // Suspended
      expect(await farmerRegistry.getVerificationStatus(1)).to.equal(3);
    });

    it('Should revert if caller is not verifier', async function () {
      await expect(
        farmerRegistry.connect(user1).verifyFarmer(1, 1)
      ).to.be.revertedWith('AccessControl: account');
    });

    it('Should revert if farmer does not exist', async function () {
      await expect(
        farmerRegistry.connect(verifier).verifyFarmer(999, 1)
      ).to.be.revertedWith('FarmerRegistry: farmer does not exist');
    });
  });

  describe('Farmer Status Management', function () {
    beforeEach(async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );
    });

    it('Should allow admin to suspend farmer', async function () {
      await expect(
        farmerRegistry.connect(admin).setFarmerStatus(1, false)
      )
        .to.emit(farmerRegistry, 'FarmerSuspended')
        .withArgs(1, false);

      expect(await farmerRegistry.isFarmerActive(1)).to.be.false;
    });

    it('Should allow admin to reactivate farmer', async function () {
      await farmerRegistry.connect(admin).setFarmerStatus(1, false);
      await farmerRegistry.connect(admin).setFarmerStatus(1, true);

      expect(await farmerRegistry.isFarmerActive(1)).to.be.true;
    });

    it('Should revert if caller is not admin', async function () {
      await expect(
        farmerRegistry.connect(user1).setFarmerStatus(1, false)
      ).to.be.revertedWith('AccessControl: account');
    });

    it('Should revert if farmer does not exist', async function () {
      await expect(
        farmerRegistry.connect(admin).setFarmerStatus(999, false)
      ).to.be.revertedWith('FarmerRegistry: farmer does not exist');
    });
  });

  describe('Query Functions', function () {
    beforeEach(async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        123, // Associated with org 123
        VERIFICATION_HASH
      );
      await farmerRegistry.connect(user2).registerFarmer(
        FARMER_NAME_2,
        LOCATION_2,
        user2.address,
        LAND_SIZE_2,
        0, // No associated organization
        VERIFICATION_HASH_2
      );
    });

    it('Should return correct farmer by ID', async function () {
      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.name).to.equal(FARMER_NAME);
      expect(farmer.walletAddress).to.equal(user1.address);
    });

    it('Should return correct farmer ID by address', async function () {
      expect(await farmerRegistry.getFarmerIdByAddress(user1.address)).to.equal(1);
      expect(await farmerRegistry.getFarmerIdByAddress(user2.address)).to.equal(2);
    });

    it('Should return zero for non-existent address', async function () {
      expect(await farmerRegistry.getFarmerIdByAddress(admin.address)).to.equal(0);
    });

    it('Should return all active farmer IDs', async function () {
      const activeIds = await farmerRegistry.getActiveFarmerIds();
      expect(activeIds.length).to.equal(2);
      expect(activeIds[0]).to.equal(1);
      expect(activeIds[1]).to.equal(2);
    });

    it('Should return farmers by organization', async function () {
      const orgFarmers = await farmerRegistry.getFarmersByOrganization(123);
      expect(orgFarmers.length).to.equal(1);
      expect(orgFarmers[0]).to.equal(1);

      const noOrgFarmers = await farmerRegistry.getFarmersByOrganization(0);
      expect(noOrgFarmers.length).to.equal(0);
    });

    it('Should return farmers by verification status', async function () {
      await farmerRegistry.connect(verifier).verifyFarmer(1, 1); // Verify farmer 1
      await farmerRegistry.connect(verifier).verifyFarmer(2, 2); // Reject farmer 2

      const verifiedFarmers = await farmerRegistry.getFarmersByVerificationStatus(1); // Verified
      expect(verifiedFarmers.length).to.equal(1);
      expect(verifiedFarmers[0]).to.equal(1);

      const rejectedFarmers = await farmerRegistry.getFarmersByVerificationStatus(2); // Rejected
      expect(rejectedFarmers.length).to.equal(1);
      expect(rejectedFarmers[0]).to.equal(2);

      const pendingFarmers = await farmerRegistry.getFarmersByVerificationStatus(0); // Pending
      expect(pendingFarmers.length).to.equal(0);
    });

    it('Should return farmers by land size range', async function () {
      const minSize = ethers.parseEther('75');
      const maxSize = ethers.parseEther('125');

      const farmersInRange = await farmerRegistry.getFarmersByLandSizeRange(minSize, maxSize);
      expect(farmersInRange.length).to.equal(1);
      expect(farmersInRange[0]).to.equal(1);

      const smallFarmers = await farmerRegistry.getFarmersByLandSizeRange(0, ethers.parseEther('60'));
      expect(smallFarmers.length).to.equal(1);
      expect(smallFarmers[0]).to.equal(2);
    });

    it('Should revert when querying non-existent farmer', async function () {
      await expect(
        farmerRegistry.getFarmer(999)
      ).to.be.revertedWith('FarmerRegistry: farmer does not exist');
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant VERIFIER_ROLE', async function () {
      await farmerRegistry.grantRole(await farmerRegistry.VERIFIER_ROLE(), user1.address);
      expect(await farmerRegistry.hasRole(await farmerRegistry.VERIFIER_ROLE(), user1.address)).to.be.true;
    });

    it('Should allow admin to revoke VERIFIER_ROLE', async function () {
      await farmerRegistry.revokeRole(await farmerRegistry.VERIFIER_ROLE(), verifier.address);
      expect(await farmerRegistry.hasRole(await farmerRegistry.VERIFIER_ROLE(), verifier.address)).to.be.false;
    });

    it('Should revert if non-admin tries to grant roles', async function () {
      await expect(
        farmerRegistry.connect(user1).grantRole(await farmerRegistry.VERIFIER_ROLE(), user2.address)
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('Edge Cases', function () {
    it('Should handle multiple farmers with different verification statuses', async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        0,
        VERIFICATION_HASH
      );
      await farmerRegistry.connect(user2).registerFarmer(
        FARMER_NAME_2,
        LOCATION_2,
        user2.address,
        LAND_SIZE_2,
        0,
        VERIFICATION_HASH_2
      );

      await farmerRegistry.connect(verifier).verifyFarmer(1, 1); // Verified
      await farmerRegistry.connect(verifier).verifyFarmer(2, 2); // Rejected

      expect(await farmerRegistry.isFarmerVerified(1)).to.be.true;
      expect(await farmerRegistry.isFarmerVerified(2)).to.be.false;
    });

    it('Should handle organization association changes correctly', async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE,
        123,
        VERIFICATION_HASH
      );

      // Change to different organization
      await farmerRegistry.connect(user1).updateOrganizationAssociation(1, 456);

      const farmer = await farmerRegistry.getFarmer(1);
      expect(farmer.associatedOrg).to.equal(456);

      // Check organization mappings
      const org123Farmers = await farmerRegistry.getFarmersByOrganization(123);
      expect(org123Farmers.length).to.equal(0);

      const org456Farmers = await farmerRegistry.getFarmersByOrganization(456);
      expect(org456Farmers.length).to.equal(1);
      expect(org456Farmers[0]).to.equal(1);
    });

    it('Should handle land size queries with exact boundaries', async function () {
      await farmerRegistry.connect(user1).registerFarmer(
        FARMER_NAME,
        LOCATION,
        user1.address,
        LAND_SIZE, // 100 hectares
        0,
        VERIFICATION_HASH
      );

      // Query with exact boundaries
      const exactRange = await farmerRegistry.getFarmersByLandSizeRange(LAND_SIZE, LAND_SIZE);
      expect(exactRange.length).to.equal(1);
      expect(exactRange[0]).to.equal(1);

      // Query with no matches
      const noMatches = await farmerRegistry.getFarmersByLandSizeRange(
        ethers.parseEther('200'),
        ethers.parseEther('300')
      );
      expect(noMatches.length).to.equal(0);
    });
  });
});
