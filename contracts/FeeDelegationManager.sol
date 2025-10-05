// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FeeDelegationManager
 * @dev Manages VeChain VIP-191 fee delegation for gasless transactions
 * @notice Handles sponsor addresses, delegation policies, and gas fee management
 * @author VeChain Builders Hackathon Team
 */
contract FeeDelegationManager is AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");
    bytes32 public constant POLICY_MANAGER_ROLE = keccak256("POLICY_MANAGER_ROLE");

    // Enums
    enum DelegationPolicy {
        None,           // No fee delegation
        Whitelist,      // Only whitelisted addresses
        Public,         // All addresses
        Conditional     // Based on conditions (e.g., user balance, activity)
    }

    enum SponsorStatus {
        Active,
        Paused,
        Suspended
    }

    // Structs
    struct SponsorInfo {
        address sponsorAddress;        // The sponsor wallet address
        string name;                   // Sponsor name/description
        uint256 maxGasPerTx;          // Maximum gas per transaction
        uint256 dailyGasLimit;        // Daily gas limit for the sponsor
        uint256 dailyGasUsed;         // Gas used today
        uint256 lastResetDate;        // Last date when daily limit was reset
        DelegationPolicy policy;      // Delegation policy for this sponsor
        SponsorStatus status;         // Current sponsor status
        uint256 totalSponsored;       // Total gas sponsored
        uint256 transactionCount;     // Number of transactions sponsored
        bool isActive;                // Whether sponsor is active
        uint256 registrationDate;     // Unix timestamp of registration
    }

    struct DelegationRequest {
        address user;                 // User requesting delegation
        address sponsor;              // Sponsor providing delegation
        uint256 gasLimit;             // Gas limit for the transaction
        uint256 gasPrice;             // Gas price (if applicable)
        uint256 timestamp;            // Request timestamp
        bool isApproved;              // Whether request is approved
        string reason;                // Reason for approval/rejection
    }

    // State variables
    mapping(address => SponsorInfo) private _sponsors;
    mapping(address => bool) private _whitelistedUsers;
    mapping(address => uint256) private _userDailyGasUsed;
    mapping(address => uint256) private _userLastResetDate;
    mapping(bytes32 => DelegationRequest) private _delegationRequests;
    
    address[] private _activeSponsors;
    uint256 private _requestIdCounter;

    // Configuration
    uint256 public constant MAX_GAS_PER_TX = 10000000; // 10M gas
    uint256 public constant MAX_DAILY_GAS_LIMIT = 100000000; // 100M gas per day
    uint256 public constant MIN_GAS_PER_TX = 21000; // Minimum gas for basic transaction
    uint256 public constant DAILY_RESET_HOUR = 0; // Reset at midnight UTC

    // Events
    event SponsorRegistered(
        address indexed sponsorAddress,
        string name,
        uint256 maxGasPerTx,
        uint256 dailyGasLimit,
        DelegationPolicy policy
    );

    event SponsorUpdated(
        address indexed sponsorAddress,
        uint256 maxGasPerTx,
        uint256 dailyGasLimit,
        DelegationPolicy policy
    );

    event SponsorStatusChanged(
        address indexed sponsorAddress,
        SponsorStatus oldStatus,
        SponsorStatus newStatus
    );

    event UserWhitelisted(
        address indexed user,
        bool isWhitelisted
    );

    event DelegationRequested(
        bytes32 indexed requestId,
        address indexed user,
        address indexed sponsor,
        uint256 gasLimit
    );

    event DelegationApproved(
        bytes32 indexed requestId,
        address indexed user,
        address indexed sponsor,
        uint256 gasLimit
    );

    event DelegationRejected(
        bytes32 indexed requestId,
        address indexed user,
        string reason
    );

    event GasSponsored(
        address indexed sponsor,
        address indexed user,
        uint256 gasUsed,
        uint256 gasPrice
    );

    event DailyLimitReset(
        address indexed sponsor,
        uint256 newLimit
    );

    // Modifiers
    modifier onlyActiveSponsor(address sponsor) {
        require(_sponsors[sponsor].isActive, "FeeDelegationManager: sponsor is not active");
        require(_sponsors[sponsor].status == SponsorStatus.Active, "FeeDelegationManager: sponsor is not active");
        _;
    }

    modifier onlyValidGasLimit(uint256 gasLimit) {
        require(gasLimit >= MIN_GAS_PER_TX, "FeeDelegationManager: gas limit too low");
        require(gasLimit <= MAX_GAS_PER_TX, "FeeDelegationManager: gas limit too high");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SPONSOR_ROLE, msg.sender);
        _grantRole(POLICY_MANAGER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new sponsor
     * @param sponsorAddress The sponsor wallet address
     * @param name Sponsor name/description
     * @param maxGasPerTx Maximum gas per transaction
     * @param dailyGasLimit Daily gas limit
     * @param policy Delegation policy
     */
    function registerSponsor(
        address sponsorAddress,
        string memory name,
        uint256 maxGasPerTx,
        uint256 dailyGasLimit,
        DelegationPolicy policy
    ) external onlyRole(SPONSOR_ROLE) {
        require(sponsorAddress != address(0), "FeeDelegationManager: invalid sponsor address");
        require(bytes(name).length > 0, "FeeDelegationManager: name cannot be empty");
        require(maxGasPerTx >= MIN_GAS_PER_TX, "FeeDelegationManager: max gas per tx too low");
        require(maxGasPerTx <= MAX_GAS_PER_TX, "FeeDelegationManager: max gas per tx too high");
        require(dailyGasLimit <= MAX_DAILY_GAS_LIMIT, "FeeDelegationManager: daily limit too high");
        require(!_sponsors[sponsorAddress].isActive, "FeeDelegationManager: sponsor already registered");

        _sponsors[sponsorAddress] = SponsorInfo({
            sponsorAddress: sponsorAddress,
            name: name,
            maxGasPerTx: maxGasPerTx,
            dailyGasLimit: dailyGasLimit,
            dailyGasUsed: 0,
            lastResetDate: block.timestamp,
            policy: policy,
            status: SponsorStatus.Active,
            totalSponsored: 0,
            transactionCount: 0,
            isActive: true,
            registrationDate: block.timestamp
        });

        _activeSponsors.push(sponsorAddress);

        emit SponsorRegistered(sponsorAddress, name, maxGasPerTx, dailyGasLimit, policy);
    }

    /**
     * @dev Update sponsor configuration
     * @param sponsorAddress The sponsor address
     * @param maxGasPerTx New maximum gas per transaction
     * @param dailyGasLimit New daily gas limit
     * @param policy New delegation policy
     */
    function updateSponsor(
        address sponsorAddress,
        uint256 maxGasPerTx,
        uint256 dailyGasLimit,
        DelegationPolicy policy
    ) external onlyRole(SPONSOR_ROLE) {
        require(_sponsors[sponsorAddress].isActive, "FeeDelegationManager: sponsor does not exist");
        require(maxGasPerTx >= MIN_GAS_PER_TX, "FeeDelegationManager: max gas per tx too low");
        require(maxGasPerTx <= MAX_GAS_PER_TX, "FeeDelegationManager: max gas per tx too high");
        require(dailyGasLimit <= MAX_DAILY_GAS_LIMIT, "FeeDelegationManager: daily limit too high");

        SponsorInfo storage sponsor = _sponsors[sponsorAddress];
        sponsor.maxGasPerTx = maxGasPerTx;
        sponsor.dailyGasLimit = dailyGasLimit;
        sponsor.policy = policy;

        emit SponsorUpdated(sponsorAddress, maxGasPerTx, dailyGasLimit, policy);
    }

    /**
     * @dev Change sponsor status
     * @param sponsorAddress The sponsor address
     * @param newStatus New sponsor status
     */
    function setSponsorStatus(
        address sponsorAddress,
        SponsorStatus newStatus
    ) external onlyRole(SPONSOR_ROLE) {
        require(_sponsors[sponsorAddress].isActive, "FeeDelegationManager: sponsor does not exist");

        SponsorInfo storage sponsor = _sponsors[sponsorAddress];
        SponsorStatus oldStatus = sponsor.status;
        sponsor.status = newStatus;

        emit SponsorStatusChanged(sponsorAddress, oldStatus, newStatus);
    }

    /**
     * @dev Add/remove user from whitelist
     * @param user The user address
     * @param isWhitelisted Whether to whitelist or remove from whitelist
     */
    function setUserWhitelist(
        address user,
        bool isWhitelisted
    ) external onlyRole(POLICY_MANAGER_ROLE) {
        _whitelistedUsers[user] = isWhitelisted;
        emit UserWhitelisted(user, isWhitelisted);
    }

    /**
     * @dev Request fee delegation
     * @param sponsor The sponsor address
     * @param gasLimit Gas limit for the transaction
     * @return requestId The delegation request ID
     */
    function requestDelegation(
        address sponsor,
        uint256 gasLimit
    ) external onlyValidGasLimit(gasLimit) returns (bytes32) {
        require(_sponsors[sponsor].isActive, "FeeDelegationManager: sponsor does not exist");
        require(_sponsors[sponsor].status == SponsorStatus.Active, "FeeDelegationManager: sponsor not active");
        require(gasLimit <= _sponsors[sponsor].maxGasPerTx, "FeeDelegationManager: gas limit exceeds sponsor max");

        // Check delegation policy
        require(_checkDelegationPolicy(sponsor, msg.sender), "FeeDelegationManager: delegation not allowed by policy");

        // Check daily limits
        _resetDailyLimitsIfNeeded(sponsor);
        require(
            _sponsors[sponsor].dailyGasUsed + gasLimit <= _sponsors[sponsor].dailyGasLimit,
            "FeeDelegationManager: daily gas limit exceeded"
        );

        _requestIdCounter++;
        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            sponsor,
            gasLimit,
            block.timestamp,
            _requestIdCounter
        ));

        _delegationRequests[requestId] = DelegationRequest({
            user: msg.sender,
            sponsor: sponsor,
            gasLimit: gasLimit,
            gasPrice: 0, // Will be set when transaction is executed
            timestamp: block.timestamp,
            isApproved: true, // Auto-approve for now, can be enhanced with manual approval
            reason: "Auto-approved"
        });

        emit DelegationRequested(requestId, msg.sender, sponsor, gasLimit);
        emit DelegationApproved(requestId, msg.sender, sponsor, gasLimit);

        return requestId;
    }

    /**
     * @dev Record gas sponsorship (called by sponsor or authorized contract)
     * @param user The user who received sponsorship
     * @param gasUsed Actual gas used in the transaction
     * @param gasPrice Gas price used
     */
    function recordGasSponsored(
        address user,
        uint256 gasUsed,
        uint256 gasPrice
    ) external onlyActiveSponsor(msg.sender) nonReentrant {
        SponsorInfo storage sponsor = _sponsors[msg.sender];
        
        // Reset daily limits if needed
        _resetDailyLimitsIfNeeded(msg.sender);
        
        // Update sponsor statistics
        sponsor.dailyGasUsed += gasUsed;
        sponsor.totalSponsored += gasUsed;
        sponsor.transactionCount++;

        // Update user daily usage
        _resetUserDailyLimitsIfNeeded(user);
        _userDailyGasUsed[user] += gasUsed;

        emit GasSponsored(msg.sender, user, gasUsed, gasPrice);
    }

    /**
     * @dev Check if delegation is allowed for a user
     * @param sponsor The sponsor address
     * @param user The user address
     * @return Whether delegation is allowed
     */
    function isDelegationAllowed(
        address sponsor,
        address user
    ) external view returns (bool) {
        if (!_sponsors[sponsor].isActive || _sponsors[sponsor].status != SponsorStatus.Active) {
            return false;
        }

        return _checkDelegationPolicy(sponsor, user);
    }

    /**
     * @dev Get sponsor information
     * @param sponsorAddress The sponsor address
     * @return Sponsor information
     */
    function getSponsorInfo(address sponsorAddress) external view returns (SponsorInfo memory) {
        require(_sponsors[sponsorAddress].isActive, "FeeDelegationManager: sponsor does not exist");
        return _sponsors[sponsorAddress];
    }

    /**
     * @dev Get available gas for sponsor today
     * @param sponsorAddress The sponsor address
     * @return Available gas amount
     */
    function getAvailableGasToday(address sponsorAddress) external view returns (uint256) {
        require(_sponsors[sponsorAddress].isActive, "FeeDelegationManager: sponsor does not exist");
        
        SponsorInfo memory sponsor = _sponsors[sponsorAddress];
        uint256 dailyUsed = _getDailyGasUsed(sponsorAddress);
        
        return sponsor.dailyGasLimit > dailyUsed ? sponsor.dailyGasLimit - dailyUsed : 0;
    }

    /**
     * @dev Get user's daily gas usage
     * @param user The user address
     * @return Daily gas used by user
     */
    function getUserDailyGasUsed(address user) external view returns (uint256) {
        return _getUserDailyGasUsed(user);
    }

    /**
     * @dev Get all active sponsors
     * @return Array of active sponsor addresses
     */
    function getActiveSponsors() external view returns (address[] memory) {
        return _activeSponsors;
    }

    /**
     * @dev Check if user is whitelisted
     * @param user The user address
     * @return Whether user is whitelisted
     */
    function isUserWhitelisted(address user) external view returns (bool) {
        return _whitelistedUsers[user];
    }

    // Internal functions
    function _checkDelegationPolicy(address sponsor, address user) internal view returns (bool) {
        DelegationPolicy policy = _sponsors[sponsor].policy;
        
        if (policy == DelegationPolicy.None) {
            return false;
        } else if (policy == DelegationPolicy.Public) {
            return true;
        } else if (policy == DelegationPolicy.Whitelist) {
            return _whitelistedUsers[user];
        } else if (policy == DelegationPolicy.Conditional) {
            // Add custom conditions here (e.g., user balance, activity, etc.)
            return _whitelistedUsers[user]; // For now, same as whitelist
        }
        
        return false;
    }

    function _resetDailyLimitsIfNeeded(address sponsor) internal {
        SponsorInfo storage sponsorInfo = _sponsors[sponsor];
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastResetDay = sponsorInfo.lastResetDate / 1 days;
        
        if (currentDay > lastResetDay) {
            sponsorInfo.dailyGasUsed = 0;
            sponsorInfo.lastResetDate = block.timestamp;
            emit DailyLimitReset(sponsor, sponsorInfo.dailyGasLimit);
        }
    }

    function _resetUserDailyLimitsIfNeeded(address user) internal {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastResetDay = _userLastResetDate[user] / 1 days;
        
        if (currentDay > lastResetDay) {
            _userDailyGasUsed[user] = 0;
            _userLastResetDate[user] = block.timestamp;
        }
    }

    function _getDailyGasUsed(address sponsor) internal view returns (uint256) {
        SponsorInfo memory sponsorInfo = _sponsors[sponsor];
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastResetDay = sponsorInfo.lastResetDate / 1 days;
        
        if (currentDay > lastResetDay) {
            return 0; // Reset for new day
        }
        
        return sponsorInfo.dailyGasUsed;
    }

    function _getUserDailyGasUsed(address user) internal view returns (uint256) {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 lastResetDay = _userLastResetDate[user] / 1 days;
        
        if (currentDay > lastResetDay) {
            return 0; // Reset for new day
        }
        
        return _userDailyGasUsed[user];
    }
}
