// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title FarmerRegistry
 * @dev Registry contract for managing farmer profiles in the carbon credit system
 * @notice Farmers can register, update their profiles, and associate with organizations
 * @author VeChain Builders Hackathon Team
 */
contract FarmerRegistry is AccessControl {

    // Role definitions
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Enums
    enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Suspended
    }

    // Farmer profile structure
    struct FarmerProfile {
        uint256 farmerId;                 // Unique farmer identifier
        string name;                      // Farmer name
        string location;                  // Geographic location (coordinates or region)
        address walletAddress;            // Primary wallet address
        uint256 landSize;                 // Land size in hectares (wei precision: 1e18 = 1 hectare)
        uint256 associatedOrg;            // Associated organization ID (0 if none)
        string verificationDocumentsHash; // IPFS hash of verification documents
        VerificationStatus verificationStatus; // Current verification status
        uint256 registrationDate;         // Unix timestamp of registration
        uint256 lastUpdated;              // Unix timestamp of last update
        bool isActive;                    // Whether the farmer is active
    }

    // State variables
    uint256 private _farmerIdCounter;
    mapping(uint256 => FarmerProfile) private _farmers;
    mapping(address => uint256) private _addressToFarmerId;
    mapping(uint256 => uint256[]) private _orgToFarmers; // orgId => array of farmerIds
    uint256[] private _activeFarmerIds;

    // Events
    event FarmerRegistered(
        uint256 indexed farmerId,
        address indexed walletAddress,
        string name,
        string location,
        uint256 landSize,
        uint256 associatedOrg,
        string verificationDocumentsHash
    );

    event FarmerUpdated(
        uint256 indexed farmerId,
        address indexed walletAddress,
        string name,
        string location,
        uint256 landSize
    );

    event FarmerVerified(
        uint256 indexed farmerId,
        VerificationStatus oldStatus,
        VerificationStatus newStatus
    );

    event FarmerSuspended(
        uint256 indexed farmerId,
        bool isActive
    );

    event OrganizationAssociationUpdated(
        uint256 indexed farmerId,
        uint256 oldOrgId,
        uint256 newOrgId
    );

    // Modifiers
    modifier onlyExistingFarmer(uint256 farmerId) {
        require(_farmers[farmerId].farmerId != 0, "FarmerRegistry: farmer does not exist");
        _;
    }

    modifier onlyActiveFarmer(uint256 farmerId) {
        require(_farmers[farmerId].isActive, "FarmerRegistry: farmer is not active");
        _;
    }

    /**
     * @dev Constructor
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    /**
     * @dev Register a new farmer
     * @param name The farmer name
     * @param location The geographic location
     * @param walletAddress The primary wallet address
     * @param landSize The land size in hectares (wei precision)
     * @param associatedOrg The associated organization ID (0 if none)
     * @param verificationDocumentsHash IPFS hash of verification documents
     * @return The assigned farmer ID
     */
    function registerFarmer(
        string memory name,
        string memory location,
        address walletAddress,
        uint256 landSize,
        uint256 associatedOrg,
        string memory verificationDocumentsHash
    ) external returns (uint256) {
        require(walletAddress != address(0), "FarmerRegistry: wallet address cannot be zero");
        require(bytes(name).length > 0, "FarmerRegistry: name cannot be empty");
        require(bytes(location).length > 0, "FarmerRegistry: location cannot be empty");
        require(landSize > 0, "FarmerRegistry: land size must be positive");
        require(bytes(verificationDocumentsHash).length > 0, "FarmerRegistry: verification documents hash cannot be empty");
        require(_addressToFarmerId[walletAddress] == 0, "FarmerRegistry: wallet address already registered");

        _farmerIdCounter++;
        uint256 farmerId = _farmerIdCounter;

        FarmerProfile memory newFarmer = FarmerProfile({
            farmerId: farmerId,
            name: name,
            location: location,
            walletAddress: walletAddress,
            landSize: landSize,
            associatedOrg: associatedOrg,
            verificationDocumentsHash: verificationDocumentsHash,
            verificationStatus: VerificationStatus.Pending,
            registrationDate: block.timestamp,
            lastUpdated: block.timestamp,
            isActive: true
        });

        _farmers[farmerId] = newFarmer;
        _addressToFarmerId[walletAddress] = farmerId;
        _activeFarmerIds.push(farmerId);

        // Add to organization's farmer list if associated
        if (associatedOrg > 0) {
            _orgToFarmers[associatedOrg].push(farmerId);
        }

        emit FarmerRegistered(
            farmerId,
            walletAddress,
            name,
            location,
            landSize,
            associatedOrg,
            verificationDocumentsHash
        );
        return farmerId;
    }

    /**
     * @dev Update farmer profile (only by farmer wallet or admin)
     * @param farmerId The farmer ID
     * @param name The new farmer name
     * @param location The new location
     * @param landSize The new land size
     */
    function updateFarmer(
        uint256 farmerId,
        string memory name,
        string memory location,
        uint256 landSize
    ) external onlyExistingFarmer(farmerId) onlyActiveFarmer(farmerId) {
        FarmerProfile storage farmer = _farmers[farmerId];
        
        require(
            farmer.walletAddress == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "FarmerRegistry: caller is not authorized to update this farmer"
        );
        require(bytes(name).length > 0, "FarmerRegistry: name cannot be empty");
        require(bytes(location).length > 0, "FarmerRegistry: location cannot be empty");
        require(landSize > 0, "FarmerRegistry: land size must be positive");

        farmer.name = name;
        farmer.location = location;
        farmer.landSize = landSize;
        farmer.lastUpdated = block.timestamp;

        emit FarmerUpdated(farmerId, farmer.walletAddress, name, location, landSize);
    }

    /**
     * @dev Update farmer's organization association (only by farmer wallet or admin)
     * @param farmerId The farmer ID
     * @param newOrgId The new organization ID (0 to remove association)
     */
    function updateOrganizationAssociation(
        uint256 farmerId,
        uint256 newOrgId
    ) external onlyExistingFarmer(farmerId) onlyActiveFarmer(farmerId) {
        FarmerProfile storage farmer = _farmers[farmerId];
        
        require(
            farmer.walletAddress == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "FarmerRegistry: caller is not authorized to update this farmer"
        );

        uint256 oldOrgId = farmer.associatedOrg;
        farmer.associatedOrg = newOrgId;
        farmer.lastUpdated = block.timestamp;

        // Remove from old organization's farmer list
        if (oldOrgId > 0) {
            uint256[] storage oldOrgFarmers = _orgToFarmers[oldOrgId];
            for (uint256 i = 0; i < oldOrgFarmers.length; i++) {
                if (oldOrgFarmers[i] == farmerId) {
                    oldOrgFarmers[i] = oldOrgFarmers[oldOrgFarmers.length - 1];
                    oldOrgFarmers.pop();
                    break;
                }
            }
        }

        // Add to new organization's farmer list
        if (newOrgId > 0) {
            _orgToFarmers[newOrgId].push(farmerId);
        }

        emit OrganizationAssociationUpdated(farmerId, oldOrgId, newOrgId);
    }

    /**
     * @dev Verify farmer (only by verifiers)
     * @param farmerId The farmer ID
     * @param newStatus The new verification status
     */
    function verifyFarmer(
        uint256 farmerId,
        VerificationStatus newStatus
    ) external onlyRole(VERIFIER_ROLE) onlyExistingFarmer(farmerId) {
        FarmerProfile storage farmer = _farmers[farmerId];
        VerificationStatus oldStatus = farmer.verificationStatus;
        
        farmer.verificationStatus = newStatus;
        farmer.lastUpdated = block.timestamp;

        emit FarmerVerified(farmerId, oldStatus, newStatus);
    }

    /**
     * @dev Suspend or reactivate farmer (only by admins)
     * @param farmerId The farmer ID
     * @param isActive The new active status
     */
    function setFarmerStatus(
        uint256 farmerId,
        bool isActive
    ) external onlyRole(DEFAULT_ADMIN_ROLE) onlyExistingFarmer(farmerId) {
        FarmerProfile storage farmer = _farmers[farmerId];
        farmer.isActive = isActive;
        farmer.lastUpdated = block.timestamp;

        emit FarmerSuspended(farmerId, isActive);
    }

    /**
     * @dev Get farmer profile by ID
     * @param farmerId The farmer ID
     * @return The farmer profile
     */
    function getFarmer(uint256 farmerId) external view onlyExistingFarmer(farmerId) returns (FarmerProfile memory) {
        return _farmers[farmerId];
    }

    /**
     * @dev Get farmer ID by wallet address
     * @param walletAddress The wallet address
     * @return The farmer ID (0 if not found)
     */
    function getFarmerIdByAddress(address walletAddress) external view returns (uint256) {
        return _addressToFarmerId[walletAddress];
    }

    /**
     * @dev Check if farmer is verified
     * @param farmerId The farmer ID
     * @return Whether the farmer is verified
     */
    function isFarmerVerified(uint256 farmerId) external view onlyExistingFarmer(farmerId) returns (bool) {
        return _farmers[farmerId].verificationStatus == VerificationStatus.Verified;
    }

    /**
     * @dev Check if farmer is active
     * @param farmerId The farmer ID
     * @return Whether the farmer is active
     */
    function isFarmerActive(uint256 farmerId) external view onlyExistingFarmer(farmerId) returns (bool) {
        return _farmers[farmerId].isActive;
    }

    /**
     * @dev Get total number of registered farmers
     * @return The total count
     */
    function getTotalFarmers() external view returns (uint256) {
        return _farmerIdCounter;
    }

    /**
     * @dev Get all active farmer IDs
     * @return Array of active farmer IDs
     */
    function getActiveFarmerIds() external view returns (uint256[] memory) {
        return _activeFarmerIds;
    }

    /**
     * @dev Get farmers associated with an organization
     * @param orgId The organization ID
     * @return Array of farmer IDs
     */
    function getFarmersByOrganization(uint256 orgId) external view returns (uint256[] memory) {
        return _orgToFarmers[orgId];
    }

    /**
     * @dev Get farmer verification status
     * @param farmerId The farmer ID
     * @return The verification status
     */
    function getVerificationStatus(uint256 farmerId) external view onlyExistingFarmer(farmerId) returns (VerificationStatus) {
        return _farmers[farmerId].verificationStatus;
    }

    /**
     * @dev Get farmer land size
     * @param farmerId The farmer ID
     * @return The land size in hectares
     */
    function getLandSize(uint256 farmerId) external view onlyExistingFarmer(farmerId) returns (uint256) {
        return _farmers[farmerId].landSize;
    }

    /**
     * @dev Get farmer's associated organization
     * @param farmerId The farmer ID
     * @return The organization ID (0 if none)
     */
    function getAssociatedOrganization(uint256 farmerId) external view onlyExistingFarmer(farmerId) returns (uint256) {
        return _farmers[farmerId].associatedOrg;
    }

    /**
     * @dev Check if wallet address is registered
     * @param walletAddress The wallet address to check
     * @return Whether the address is registered
     */
    function isAddressRegistered(address walletAddress) external view returns (bool) {
        return _addressToFarmerId[walletAddress] != 0;
    }

    /**
     * @dev Get farmers by verification status
     * @param status The verification status to filter by
     * @return Array of farmer IDs with the specified status
     */
    function getFarmersByVerificationStatus(VerificationStatus status) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_activeFarmerIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < _activeFarmerIds.length; i++) {
            if (_farmers[_activeFarmerIds[i]].verificationStatus == status) {
                result[count] = _activeFarmerIds[i];
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }

        return finalResult;
    }

    /**
     * @dev Get farmers by land size range
     * @param minSize Minimum land size in hectares
     * @param maxSize Maximum land size in hectares
     * @return Array of farmer IDs within the land size range
     */
    function getFarmersByLandSizeRange(uint256 minSize, uint256 maxSize) external view returns (uint256[] memory) {
        uint256[] memory result = new uint256[](_activeFarmerIds.length);
        uint256 count = 0;

        for (uint256 i = 0; i < _activeFarmerIds.length; i++) {
            uint256 landSize = _farmers[_activeFarmerIds[i]].landSize;
            if (landSize >= minSize && landSize <= maxSize) {
                result[count] = _activeFarmerIds[i];
                count++;
            }
        }

        // Resize array to actual count
        uint256[] memory finalResult = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalResult[i] = result[i];
        }

        return finalResult;
    }
}
