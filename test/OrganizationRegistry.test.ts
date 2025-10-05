import { expect } from 'chai';
import { ethers } from 'hardhat';
import { OrganizationRegistry } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('OrganizationRegistry', function () {
  let organizationRegistry: OrganizationRegistry;
  let admin: SignerWithAddress;
  let verifier: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test constants
  const ORG_NAME = 'Green Energy Corp';
  const ORG_NAME_2 = 'Carbon Solutions Ltd';
  const LOCATION = 'New York, USA';
  const KYC_HASH = 'QmKycHash123456789';
  const KYC_HASH_2 = 'QmKycHash987654321';

  beforeEach(async function () {
    [admin, verifier, user1, user2] = await ethers.getSigners();

    // Deploy fresh contract before each test
    const OrganizationRegistryFactory = await ethers.getContractFactory('OrganizationRegistry');
    organizationRegistry = await OrganizationRegistryFactory.deploy();
    await organizationRegistry.waitForDeployment();

    // Grant VERIFIER_ROLE to verifier address
    await organizationRegistry.grantRole(await organizationRegistry.VERIFIER_ROLE(), verifier.address);
  });

  describe('Deployment', function () {
    it('Should grant admin role to deployer', async function () {
      expect(await organizationRegistry.hasRole(await organizationRegistry.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it('Should grant verifier role to deployer', async function () {
      expect(await organizationRegistry.hasRole(await organizationRegistry.VERIFIER_ROLE(), admin.address)).to.be.true;
    });

    it('Should start with zero total organizations', async function () {
      expect(await organizationRegistry.getTotalOrganizations()).to.equal(0);
    });
  });

  describe('Organization Registration', function () {
    it('Should register organization with correct data', async function () {
      const tx = await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );

      const receipt = await tx.wait();
      const orgId = 1;

      // Check organization data
      const org = await organizationRegistry.getOrganization(orgId);
      expect(org.orgId).to.equal(orgId);
      expect(org.name).to.equal(ORG_NAME);
      expect(org.walletAddress).to.equal(user1.address);
      expect(org.verificationStatus).to.equal(0); // Pending
      expect(org.totalCreditsGenerated).to.equal(0);
      expect(org.kycDocumentsHash).to.equal(KYC_HASH);
      expect(org.registrationDate).to.be.greaterThan(0);
      expect(org.lastUpdated).to.be.greaterThan(0);
      expect(org.isActive).to.be.true;

      // Check mappings
      expect(await organizationRegistry.getOrgIdByAddress(user1.address)).to.equal(orgId);
      expect(await organizationRegistry.getOrgIdByName(ORG_NAME)).to.equal(orgId);
      expect(await organizationRegistry.isAddressRegistered(user1.address)).to.be.true;
      expect(await organizationRegistry.isNameTaken(ORG_NAME)).to.be.true;
    });

    it('Should emit OrganizationRegistered event', async function () {
      await expect(
        organizationRegistry.connect(user1).registerOrganization(
          ORG_NAME,
          user1.address,
          KYC_HASH
        )
      )
        .to.emit(organizationRegistry, 'OrganizationRegistered')
        .withArgs(1, user1.address, ORG_NAME, KYC_HASH);
    });

    it('Should increment organization counter', async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );

      await organizationRegistry.connect(user2).registerOrganization(
        ORG_NAME_2,
        user2.address,
        KYC_HASH_2
      );

      expect(await organizationRegistry.getTotalOrganizations()).to.equal(2);
    });

    it('Should revert if wallet address is zero', async function () {
      await expect(
        organizationRegistry.connect(user1).registerOrganization(
          ORG_NAME,
          ethers.ZeroAddress,
          KYC_HASH
        )
      ).to.be.revertedWith('OrganizationRegistry: wallet address cannot be zero');
    });

    it('Should revert if name is empty', async function () {
      await expect(
        organizationRegistry.connect(user1).registerOrganization(
          '',
          user1.address,
          KYC_HASH
        )
      ).to.be.revertedWith('OrganizationRegistry: name cannot be empty');
    });

    it('Should revert if KYC hash is empty', async function () {
      await expect(
        organizationRegistry.connect(user1).registerOrganization(
          ORG_NAME,
          user1.address,
          ''
        )
      ).to.be.revertedWith('OrganizationRegistry: KYC documents hash cannot be empty');
    });

    it('Should revert if wallet address already registered', async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );

      await expect(
        organizationRegistry.connect(user1).registerOrganization(
          ORG_NAME_2,
          user1.address,
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: wallet address already registered');
    });

    it('Should revert if organization name already exists', async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );

      await expect(
        organizationRegistry.connect(user2).registerOrganization(
          ORG_NAME,
          user2.address,
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: organization name already exists');
    });
  });

  describe('Organization Updates', function () {
    beforeEach(async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );
    });

    it('Should allow organization to update their profile', async function () {
      await expect(
        organizationRegistry.connect(user1).updateOrganization(
          1,
          ORG_NAME_2,
          KYC_HASH_2
        )
      )
        .to.emit(organizationRegistry, 'OrganizationUpdated')
        .withArgs(1, user1.address, ORG_NAME_2);

      const org = await organizationRegistry.getOrganization(1);
      expect(org.name).to.equal(ORG_NAME_2);
      expect(org.kycDocumentsHash).to.equal(KYC_HASH_2);
      expect(org.lastUpdated).to.be.greaterThan(org.registrationDate);
    });

    it('Should allow admin to update any organization', async function () {
      await organizationRegistry.connect(admin).updateOrganization(
        1,
        ORG_NAME_2,
        KYC_HASH_2
      );

      const org = await organizationRegistry.getOrganization(1);
      expect(org.name).to.equal(ORG_NAME_2);
    });

    it('Should revert if caller is not authorized', async function () {
      await expect(
        organizationRegistry.connect(user2).updateOrganization(
          1,
          ORG_NAME_2,
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: caller is not authorized to update this organization');
    });

    it('Should revert if organization does not exist', async function () {
      await expect(
        organizationRegistry.connect(user1).updateOrganization(
          999,
          ORG_NAME_2,
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: organization does not exist');
    });

    it('Should revert if organization is not active', async function () {
      await organizationRegistry.connect(admin).setOrganizationStatus(1, false);

      await expect(
        organizationRegistry.connect(user1).updateOrganization(
          1,
          ORG_NAME_2,
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: organization is not active');
    });

    it('Should revert if new name is empty', async function () {
      await expect(
        organizationRegistry.connect(user1).updateOrganization(
          1,
          '',
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: name cannot be empty');
    });

    it('Should revert if new KYC hash is empty', async function () {
      await expect(
        organizationRegistry.connect(user1).updateOrganization(
          1,
          ORG_NAME_2,
          ''
        )
      ).to.be.revertedWith('OrganizationRegistry: KYC documents hash cannot be empty');
    });

    it('Should revert if new name already exists', async function () {
      await organizationRegistry.connect(user2).registerOrganization(
        ORG_NAME_2,
        user2.address,
        KYC_HASH_2
      );

      await expect(
        organizationRegistry.connect(user1).updateOrganization(
          1,
          ORG_NAME_2,
          KYC_HASH_2
        )
      ).to.be.revertedWith('OrganizationRegistry: organization name already exists');
    });
  });

  describe('Organization Verification', function () {
    beforeEach(async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );
    });

    it('Should allow verifier to verify organization', async function () {
      await expect(
        organizationRegistry.connect(verifier).verifyOrganization(1, 1) // Verified
      )
        .to.emit(organizationRegistry, 'OrganizationVerified')
        .withArgs(1, 0, 1); // orgId, oldStatus (Pending), newStatus (Verified)

      expect(await organizationRegistry.getVerificationStatus(1)).to.equal(1);
      expect(await organizationRegistry.isOrganizationVerified(1)).to.be.true;
    });

    it('Should allow verifier to reject organization', async function () {
      await organizationRegistry.connect(verifier).verifyOrganization(1, 2); // Rejected
      expect(await organizationRegistry.getVerificationStatus(1)).to.equal(2);
      expect(await organizationRegistry.isOrganizationVerified(1)).to.be.false;
    });

    it('Should allow verifier to suspend organization', async function () {
      await organizationRegistry.connect(verifier).verifyOrganization(1, 3); // Suspended
      expect(await organizationRegistry.getVerificationStatus(1)).to.equal(3);
    });

    it('Should revert if caller is not verifier', async function () {
      await expect(
        organizationRegistry.connect(user1).verifyOrganization(1, 1)
      ).to.be.revertedWith('AccessControl: account');
    });

    it('Should revert if organization does not exist', async function () {
      await expect(
        organizationRegistry.connect(verifier).verifyOrganization(999, 1)
      ).to.be.revertedWith('OrganizationRegistry: organization does not exist');
    });
  });

  describe('Organization Status Management', function () {
    beforeEach(async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );
    });

    it('Should allow admin to suspend organization', async function () {
      await expect(
        organizationRegistry.connect(admin).setOrganizationStatus(1, false)
      )
        .to.emit(organizationRegistry, 'OrganizationSuspended')
        .withArgs(1, false);

      expect(await organizationRegistry.isOrganizationActive(1)).to.be.false;
    });

    it('Should allow admin to reactivate organization', async function () {
      await organizationRegistry.connect(admin).setOrganizationStatus(1, false);
      await organizationRegistry.connect(admin).setOrganizationStatus(1, true);

      expect(await organizationRegistry.isOrganizationActive(1)).to.be.true;
    });

    it('Should revert if caller is not admin', async function () {
      await expect(
        organizationRegistry.connect(user1).setOrganizationStatus(1, false)
      ).to.be.revertedWith('AccessControl: account');
    });

    it('Should revert if organization does not exist', async function () {
      await expect(
        organizationRegistry.connect(admin).setOrganizationStatus(999, false)
      ).to.be.revertedWith('OrganizationRegistry: organization does not exist');
    });
  });

  describe('Credits Generated Updates', function () {
    beforeEach(async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );
    });

    it('Should update credits generated', async function () {
      const additionalCredits = ethers.parseEther('1000');

      await expect(
        organizationRegistry.connect(admin).updateCreditsGenerated(1, additionalCredits)
      )
        .to.emit(organizationRegistry, 'CreditsGeneratedUpdated')
        .withArgs(1, 0, additionalCredits);

      expect(await organizationRegistry.getTotalCreditsGenerated(1)).to.equal(additionalCredits);
    });

    it('Should accumulate credits over multiple updates', async function () {
      const credits1 = ethers.parseEther('500');
      const credits2 = ethers.parseEther('300');

      await organizationRegistry.connect(admin).updateCreditsGenerated(1, credits1);
      await organizationRegistry.connect(admin).updateCreditsGenerated(1, credits2);

      expect(await organizationRegistry.getTotalCreditsGenerated(1)).to.equal(credits1 + credits2);
    });

    it('Should revert if organization does not exist', async function () {
      await expect(
        organizationRegistry.connect(admin).updateCreditsGenerated(999, ethers.parseEther('1000'))
      ).to.be.revertedWith('OrganizationRegistry: organization does not exist');
    });

    it('Should revert if organization is not active', async function () {
      await organizationRegistry.connect(admin).setOrganizationStatus(1, false);

      await expect(
        organizationRegistry.connect(admin).updateCreditsGenerated(1, ethers.parseEther('1000'))
      ).to.be.revertedWith('OrganizationRegistry: organization is not active');
    });
  });

  describe('Query Functions', function () {
    beforeEach(async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );
      await organizationRegistry.connect(user2).registerOrganization(
        ORG_NAME_2,
        user2.address,
        KYC_HASH_2
      );
    });

    it('Should return correct organization by ID', async function () {
      const org = await organizationRegistry.getOrganization(1);
      expect(org.name).to.equal(ORG_NAME);
      expect(org.walletAddress).to.equal(user1.address);
    });

    it('Should return correct organization ID by address', async function () {
      expect(await organizationRegistry.getOrgIdByAddress(user1.address)).to.equal(1);
      expect(await organizationRegistry.getOrgIdByAddress(user2.address)).to.equal(2);
    });

    it('Should return correct organization ID by name', async function () {
      expect(await organizationRegistry.getOrgIdByName(ORG_NAME)).to.equal(1);
      expect(await organizationRegistry.getOrgIdByName(ORG_NAME_2)).to.equal(2);
    });

    it('Should return zero for non-existent address', async function () {
      expect(await organizationRegistry.getOrgIdByAddress(admin.address)).to.equal(0);
    });

    it('Should return zero for non-existent name', async function () {
      expect(await organizationRegistry.getOrgIdByName('NonExistent')).to.equal(0);
    });

    it('Should return all active organization IDs', async function () {
      const activeIds = await organizationRegistry.getActiveOrganizationIds();
      expect(activeIds.length).to.equal(2);
      expect(activeIds[0]).to.equal(1);
      expect(activeIds[1]).to.equal(2);
    });

    it('Should revert when querying non-existent organization', async function () {
      await expect(
        organizationRegistry.getOrganization(999)
      ).to.be.revertedWith('OrganizationRegistry: organization does not exist');
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant VERIFIER_ROLE', async function () {
      await organizationRegistry.grantRole(await organizationRegistry.VERIFIER_ROLE(), user1.address);
      expect(await organizationRegistry.hasRole(await organizationRegistry.VERIFIER_ROLE(), user1.address)).to.be.true;
    });

    it('Should allow admin to revoke VERIFIER_ROLE', async function () {
      await organizationRegistry.revokeRole(await organizationRegistry.VERIFIER_ROLE(), verifier.address);
      expect(await organizationRegistry.hasRole(await organizationRegistry.VERIFIER_ROLE(), verifier.address)).to.be.false;
    });

    it('Should revert if non-admin tries to grant roles', async function () {
      await expect(
        organizationRegistry.connect(user1).grantRole(await organizationRegistry.VERIFIER_ROLE(), user2.address)
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('Edge Cases', function () {
    it('Should handle multiple organizations with different verification statuses', async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );
      await organizationRegistry.connect(user2).registerOrganization(
        ORG_NAME_2,
        user2.address,
        KYC_HASH_2
      );

      await organizationRegistry.connect(verifier).verifyOrganization(1, 1); // Verified
      await organizationRegistry.connect(verifier).verifyOrganization(2, 2); // Rejected

      expect(await organizationRegistry.isOrganizationVerified(1)).to.be.true;
      expect(await organizationRegistry.isOrganizationVerified(2)).to.be.false;
    });

    it('Should handle organization name updates correctly', async function () {
      await organizationRegistry.connect(user1).registerOrganization(
        ORG_NAME,
        user1.address,
        KYC_HASH
      );

      // Update name
      await organizationRegistry.connect(user1).updateOrganization(
        1,
        ORG_NAME_2,
        KYC_HASH_2
      );

      // Check mappings are updated
      expect(await organizationRegistry.getOrgIdByName(ORG_NAME)).to.equal(0);
      expect(await organizationRegistry.getOrgIdByName(ORG_NAME_2)).to.equal(1);
    });
  });
});
