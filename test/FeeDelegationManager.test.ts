import { expect } from 'chai';
import { ethers } from 'hardhat';
import { FeeDelegationManager } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('FeeDelegationManager', function () {
  let feeDelegationManager: FeeDelegationManager;
  let admin: SignerWithAddress;
  let sponsor: SignerWithAddress;
  let policyManager: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test constants
  const SPONSOR_NAME = 'Test Sponsor';
  const MAX_GAS_PER_TX = 1000000;
  const DAILY_GAS_LIMIT = 10000000;

  beforeEach(async function () {
    [admin, sponsor, policyManager, user1, user2] = await ethers.getSigners();

    // Deploy fresh contract before each test
    const FeeDelegationManagerFactory = await ethers.getContractFactory('FeeDelegationManager');
    feeDelegationManager = await FeeDelegationManagerFactory.deploy();
    await feeDelegationManager.waitForDeployment();

    // Grant roles
    await feeDelegationManager.grantRole(await feeDelegationManager.SPONSOR_ROLE(), sponsor.address);
    await feeDelegationManager.grantRole(await feeDelegationManager.POLICY_MANAGER_ROLE(), policyManager.address);
  });

  describe('Deployment', function () {
    it('Should grant admin role to deployer', async function () {
      expect(await feeDelegationManager.hasRole(await feeDelegationManager.DEFAULT_ADMIN_ROLE(), admin.address)).to.be.true;
    });

    it('Should have correct constants', async function () {
      expect(await feeDelegationManager.MAX_GAS_PER_TX()).to.equal(10000000);
      expect(await feeDelegationManager.MAX_DAILY_GAS_LIMIT()).to.equal(100000000);
      expect(await feeDelegationManager.MIN_GAS_PER_TX()).to.equal(21000);
    });
  });

  describe('Sponsor Registration', function () {
    it('Should register sponsor successfully', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          sponsor.address,
          SPONSOR_NAME,
          MAX_GAS_PER_TX,
          DAILY_GAS_LIMIT,
          1 // Whitelist policy
        )
      )
        .to.emit(feeDelegationManager, 'SponsorRegistered')
        .withArgs(sponsor.address, SPONSOR_NAME, MAX_GAS_PER_TX, DAILY_GAS_LIMIT, 1);

      const sponsorInfo = await feeDelegationManager.getSponsorInfo(sponsor.address);
      expect(sponsorInfo.sponsorAddress).to.equal(sponsor.address);
      expect(sponsorInfo.name).to.equal(SPONSOR_NAME);
      expect(sponsorInfo.maxGasPerTx).to.equal(MAX_GAS_PER_TX);
      expect(sponsorInfo.dailyGasLimit).to.equal(DAILY_GAS_LIMIT);
      expect(sponsorInfo.policy).to.equal(1); // Whitelist
      expect(sponsorInfo.status).to.equal(0); // Active
      expect(sponsorInfo.isActive).to.be.true;
    });

    it('Should revert if sponsor address is zero', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          ethers.ZeroAddress,
          SPONSOR_NAME,
          MAX_GAS_PER_TX,
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: invalid sponsor address');
    });

    it('Should revert if name is empty', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          sponsor.address,
          '',
          MAX_GAS_PER_TX,
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: name cannot be empty');
    });

    it('Should revert if max gas per tx is too low', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          sponsor.address,
          SPONSOR_NAME,
          10000, // Below minimum
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: max gas per tx too low');
    });

    it('Should revert if max gas per tx is too high', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          sponsor.address,
          SPONSOR_NAME,
          20000000, // Above maximum
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: max gas per tx too high');
    });

    it('Should revert if daily limit is too high', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          sponsor.address,
          SPONSOR_NAME,
          MAX_GAS_PER_TX,
          200000000, // Above maximum
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: daily limit too high');
    });

    it('Should revert if sponsor already registered', async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        1
      );

      await expect(
        feeDelegationManager.connect(sponsor).registerSponsor(
          sponsor.address,
          'Another Sponsor',
          MAX_GAS_PER_TX,
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: sponsor already registered');
    });

    it('Should revert if caller is not authorized', async function () {
      await expect(
        feeDelegationManager.connect(user1).registerSponsor(
          sponsor.address,
          SPONSOR_NAME,
          MAX_GAS_PER_TX,
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('Sponsor Management', function () {
    beforeEach(async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        1 // Whitelist
      );
    });

    it('Should update sponsor configuration', async function () {
      const newMaxGas = 2000000;
      const newDailyLimit = 20000000;
      const newPolicy = 2; // Public

      await expect(
        feeDelegationManager.connect(sponsor).updateSponsor(
          sponsor.address,
          newMaxGas,
          newDailyLimit,
          newPolicy
        )
      )
        .to.emit(feeDelegationManager, 'SponsorUpdated')
        .withArgs(sponsor.address, newMaxGas, newDailyLimit, newPolicy);

      const sponsorInfo = await feeDelegationManager.getSponsorInfo(sponsor.address);
      expect(sponsorInfo.maxGasPerTx).to.equal(newMaxGas);
      expect(sponsorInfo.dailyGasLimit).to.equal(newDailyLimit);
      expect(sponsorInfo.policy).to.equal(newPolicy);
    });

    it('Should change sponsor status', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).setSponsorStatus(sponsor.address, 1) // Paused
      )
        .to.emit(feeDelegationManager, 'SponsorStatusChanged')
        .withArgs(sponsor.address, 0, 1);

      const sponsorInfo = await feeDelegationManager.getSponsorInfo(sponsor.address);
      expect(sponsorInfo.status).to.equal(1); // Paused
    });

    it('Should revert if sponsor does not exist', async function () {
      await expect(
        feeDelegationManager.connect(sponsor).updateSponsor(
          user1.address,
          MAX_GAS_PER_TX,
          DAILY_GAS_LIMIT,
          1
        )
      ).to.be.revertedWith('FeeDelegationManager: sponsor does not exist');
    });
  });

  describe('User Whitelist Management', function () {
    it('Should add user to whitelist', async function () {
      await expect(
        feeDelegationManager.connect(policyManager).setUserWhitelist(user1.address, true)
      )
        .to.emit(feeDelegationManager, 'UserWhitelisted')
        .withArgs(user1.address, true);

      expect(await feeDelegationManager.isUserWhitelisted(user1.address)).to.be.true;
    });

    it('Should remove user from whitelist', async function () {
      await feeDelegationManager.connect(policyManager).setUserWhitelist(user1.address, true);
      
      await expect(
        feeDelegationManager.connect(policyManager).setUserWhitelist(user1.address, false)
      )
        .to.emit(feeDelegationManager, 'UserWhitelisted')
        .withArgs(user1.address, false);

      expect(await feeDelegationManager.isUserWhitelisted(user1.address)).to.be.false;
    });

    it('Should revert if caller is not policy manager', async function () {
      await expect(
        feeDelegationManager.connect(user1).setUserWhitelist(user1.address, true)
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('Delegation Requests', function () {
    beforeEach(async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        1 // Whitelist
      );
      await feeDelegationManager.connect(policyManager).setUserWhitelist(user1.address, true);
    });

    it('Should request delegation successfully', async function () {
      const gasLimit = 100000;

      const tx = await feeDelegationManager.connect(user1).requestDelegation(sponsor.address, gasLimit);
      const receipt = await tx.wait();

      // Check events
      const events = receipt?.logs.filter(log => {
        try {
          const parsed = feeDelegationManager.interface.parseLog(log);
          return parsed?.name === 'DelegationRequested' || parsed?.name === 'DelegationApproved';
        } catch {
          return false;
        }
      });

      expect(events?.length).to.be.greaterThan(0);
    });

    it('Should revert if sponsor does not exist', async function () {
      await expect(
        feeDelegationManager.connect(user1).requestDelegation(user2.address, 100000)
      ).to.be.revertedWith('FeeDelegationManager: sponsor does not exist');
    });

    it('Should revert if sponsor is not active', async function () {
      await feeDelegationManager.connect(sponsor).setSponsorStatus(sponsor.address, 1); // Paused

      await expect(
        feeDelegationManager.connect(user1).requestDelegation(sponsor.address, 100000)
      ).to.be.revertedWith('FeeDelegationManager: sponsor not active');
    });

    it('Should revert if gas limit exceeds sponsor max', async function () {
      await expect(
        feeDelegationManager.connect(user1).requestDelegation(sponsor.address, 2000000) // Above max
      ).to.be.revertedWith('FeeDelegationManager: gas limit exceeds sponsor max');
    });

    it('Should revert if delegation not allowed by policy', async function () {
      // User2 is not whitelisted
      await expect(
        feeDelegationManager.connect(user2).requestDelegation(sponsor.address, 100000)
      ).to.be.revertedWith('FeeDelegationManager: delegation not allowed by policy');
    });

    it('Should revert if daily gas limit exceeded', async function () {
      // Set a very low daily limit
      await feeDelegationManager.connect(sponsor).updateSponsor(
        sponsor.address,
        MAX_GAS_PER_TX,
        50000, // Very low daily limit
        1
      );

      await expect(
        feeDelegationManager.connect(user1).requestDelegation(sponsor.address, 100000)
      ).to.be.revertedWith('FeeDelegationManager: daily gas limit exceeded');
    });
  });

  describe('Gas Sponsorship Recording', function () {
    beforeEach(async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        2 // Public policy
      );
    });

    it('Should record gas sponsorship', async function () {
      const gasUsed = 50000;
      const gasPrice = 1000000000; // 1 gwei

      await expect(
        feeDelegationManager.connect(sponsor).recordGasSponsored(user1.address, gasUsed, gasPrice)
      )
        .to.emit(feeDelegationManager, 'GasSponsored')
        .withArgs(sponsor.address, user1.address, gasUsed, gasPrice);

      const sponsorInfo = await feeDelegationManager.getSponsorInfo(sponsor.address);
      expect(sponsorInfo.dailyGasUsed).to.equal(gasUsed);
      expect(sponsorInfo.totalSponsored).to.equal(gasUsed);
      expect(sponsorInfo.transactionCount).to.equal(1);
    });

    it('Should revert if caller is not an active sponsor', async function () {
      await expect(
        feeDelegationManager.connect(user1).recordGasSponsored(user1.address, 50000, 1000000000)
      ).to.be.revertedWith('FeeDelegationManager: sponsor is not active');
    });
  });

  describe('Delegation Policy Checks', function () {
    beforeEach(async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        1 // Whitelist
      );
    });

    it('Should allow delegation for whitelisted user', async function () {
      await feeDelegationManager.connect(policyManager).setUserWhitelist(user1.address, true);
      
      expect(
        await feeDelegationManager.isDelegationAllowed(sponsor.address, user1.address)
      ).to.be.true;
    });

    it('Should deny delegation for non-whitelisted user', async function () {
      expect(
        await feeDelegationManager.isDelegationAllowed(sponsor.address, user2.address)
      ).to.be.false;
    });

    it('Should deny delegation if sponsor is not active', async function () {
      await feeDelegationManager.connect(sponsor).setSponsorStatus(sponsor.address, 1); // Paused
      
      expect(
        await feeDelegationManager.isDelegationAllowed(sponsor.address, user1.address)
      ).to.be.false;
    });
  });

  describe('Query Functions', function () {
    beforeEach(async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        1
      );
    });

    it('Should return available gas for sponsor today', async function () {
      const availableGas = await feeDelegationManager.getAvailableGasToday(sponsor.address);
      expect(availableGas).to.equal(DAILY_GAS_LIMIT);
    });

    it('Should return user daily gas used', async function () {
      const dailyGasUsed = await feeDelegationManager.getUserDailyGasUsed(user1.address);
      expect(dailyGasUsed).to.equal(0);
    });

    it('Should return active sponsors', async function () {
      const activeSponsors = await feeDelegationManager.getActiveSponsors();
      expect(activeSponsors.length).to.equal(1);
      expect(activeSponsors[0]).to.equal(sponsor.address);
    });

    it('Should revert when querying non-existent sponsor', async function () {
      await expect(
        feeDelegationManager.getSponsorInfo(user1.address)
      ).to.be.revertedWith('FeeDelegationManager: sponsor does not exist');
    });
  });

  describe('Access Control', function () {
    it('Should allow admin to grant SPONSOR_ROLE', async function () {
      await feeDelegationManager.grantRole(await feeDelegationManager.SPONSOR_ROLE(), user1.address);
      expect(await feeDelegationManager.hasRole(await feeDelegationManager.SPONSOR_ROLE(), user1.address)).to.be.true;
    });

    it('Should allow admin to grant POLICY_MANAGER_ROLE', async function () {
      await feeDelegationManager.grantRole(await feeDelegationManager.POLICY_MANAGER_ROLE(), user1.address);
      expect(await feeDelegationManager.hasRole(await feeDelegationManager.POLICY_MANAGER_ROLE(), user1.address)).to.be.true;
    });

    it('Should revert if non-admin tries to grant roles', async function () {
      await expect(
        feeDelegationManager.connect(user1).grantRole(await feeDelegationManager.SPONSOR_ROLE(), user2.address)
      ).to.be.revertedWith('AccessControl: account');
    });
  });

  describe('Edge Cases', function () {
    it('Should handle multiple sponsors with different policies', async function () {
      // Register first sponsor with whitelist policy
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        'Whitelist Sponsor',
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        1 // Whitelist
      );

      // Register second sponsor with public policy
      await feeDelegationManager.connect(admin).registerSponsor(
        admin.address,
        'Public Sponsor',
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        2 // Public
      );

      // Whitelist user1
      await feeDelegationManager.connect(policyManager).setUserWhitelist(user1.address, true);

      // Check delegation policies
      expect(await feeDelegationManager.isDelegationAllowed(sponsor.address, user1.address)).to.be.true;
      expect(await feeDelegationManager.isDelegationAllowed(sponsor.address, user2.address)).to.be.false;
      expect(await feeDelegationManager.isDelegationAllowed(admin.address, user1.address)).to.be.true;
      expect(await feeDelegationManager.isDelegationAllowed(admin.address, user2.address)).to.be.true;

      const activeSponsors = await feeDelegationManager.getActiveSponsors();
      expect(activeSponsors.length).to.equal(2);
    });

    it('Should handle gas sponsorship accumulation', async function () {
      await feeDelegationManager.connect(sponsor).registerSponsor(
        sponsor.address,
        SPONSOR_NAME,
        MAX_GAS_PER_TX,
        DAILY_GAS_LIMIT,
        2 // Public
      );

      // Record multiple gas sponsorships
      await feeDelegationManager.connect(sponsor).recordGasSponsored(user1.address, 10000, 1000000000);
      await feeDelegationManager.connect(sponsor).recordGasSponsored(user1.address, 20000, 1000000000);
      await feeDelegationManager.connect(sponsor).recordGasSponsored(user2.address, 15000, 1000000000);

      const sponsorInfo = await feeDelegationManager.getSponsorInfo(sponsor.address);
      expect(sponsorInfo.dailyGasUsed).to.equal(45000);
      expect(sponsorInfo.totalSponsored).to.equal(45000);
      expect(sponsorInfo.transactionCount).to.equal(3);

      const user1DailyGas = await feeDelegationManager.getUserDailyGasUsed(user1.address);
      const user2DailyGas = await feeDelegationManager.getUserDailyGasUsed(user2.address);
      expect(user1DailyGas).to.equal(30000);
      expect(user2DailyGas).to.equal(15000);
    });
  });
});
