// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFarmerRegistry
 * @dev Interface for FarmerRegistry contract to enable clean integration with other contracts
 * @notice This interface will be used by CarbonCreditNFT, verifier contracts, and other integrations
 * @author VeChain Builders Hackathon Team
 */
interface IFarmerRegistry {
    // Enums (must be redeclared in interface)
    enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Suspended
    }

    // Struct for return types
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

    // Function signatures (external functions only)
    function registerFarmer(
        string memory name,
        string memory location,
        address walletAddress,
        uint256 landSize,
        uint256 associatedOrg,
        string memory verificationDocumentsHash
    ) external returns (uint256);

    function updateFarmer(
        uint256 farmerId,
        string memory name,
        string memory location,
        uint256 landSize
    ) external;

    function updateOrganizationAssociation(
        uint256 farmerId,
        uint256 newOrgId
    ) external;

    function verifyFarmer(
        uint256 farmerId,
        VerificationStatus newStatus
    ) external;

    function setFarmerStatus(
        uint256 farmerId,
        bool isActive
    ) external;

    function getFarmer(uint256 farmerId) external view returns (FarmerProfile memory);

    function getFarmerIdByAddress(address walletAddress) external view returns (uint256);

    function isFarmerVerified(uint256 farmerId) external view returns (bool);

    function isFarmerActive(uint256 farmerId) external view returns (bool);

    function getTotalFarmers() external view returns (uint256);

    function getActiveFarmerIds() external view returns (uint256[] memory);

    function getFarmersByOrganization(uint256 orgId) external view returns (uint256[] memory);

    function getVerificationStatus(uint256 farmerId) external view returns (VerificationStatus);

    function getLandSize(uint256 farmerId) external view returns (uint256);

    function getAssociatedOrganization(uint256 farmerId) external view returns (uint256);

    function isAddressRegistered(address walletAddress) external view returns (bool);

    function getFarmersByVerificationStatus(VerificationStatus status) external view returns (uint256[] memory);

    function getFarmersByLandSizeRange(uint256 minSize, uint256 maxSize) external view returns (uint256[] memory);

    // Events (must be declared in interface for external contracts to reference)
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
}
