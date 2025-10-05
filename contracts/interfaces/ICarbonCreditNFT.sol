// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICarbonCreditNFT
 * @dev Interface for CarbonCreditNFT contract to enable clean integration with future contracts
 * @notice This interface will be used by CarbonCreditVerifier, bridge contracts, and other integrations
 * @author VeChain Builders Hackathon Team
 */
interface ICarbonCreditNFT {
    // Enums (must be redeclared in interface)
    enum VerificationStatus {
        Pending,
        Verified,
        Rejected,
        Retired
    }

    enum ProjectType {
        Reforestation,
        RenewableEnergy,
        SoilCarbon,
        Biochar,
        Other
    }

    // Struct for return types
    struct CarbonCreditMetadata {
        uint256 creditId;           // Unique identifier (same as tokenId)
        uint256 carbonAmount;       // Amount in tonnes CO2 (wei-like precision: 1e18 = 1 tonne)
        address generatorAddress;   // Farmer or organization who generated the credit
        string location;            // Geographic location (lat/long string or region name)
        VerificationStatus verificationStatus; // Current verification status
        uint256 generationDate;     // Unix timestamp when carbon was captured/offset
        uint256 expiryDate;         // Unix timestamp when credit expires (0 if no expiry)
        ProjectType projectType;    // Type of carbon project
        string proofsIPFSHash;      // IPFS CID pointing to verification documents/IoT data
    }

    // Function signatures (external functions only)
    function mintCarbonCredit(
        address to,
        uint256 carbonAmount,
        string memory location,
        ProjectType projectType,
        string memory proofsIPFSHash,
        string memory tokenURI
    ) external returns (uint256);

    function burnCarbonCredit(uint256 tokenId) external;

    function retireCarbonCredit(uint256 tokenId) external;

    function updateVerificationStatus(
        uint256 tokenId,
        VerificationStatus newStatus
    ) external;

    function getCreditMetadata(
        uint256 tokenId
    ) external view returns (CarbonCreditMetadata memory);

    function getCarbonAmount(uint256 tokenId) external view returns (uint256);

    function getGeneratorAddress(uint256 tokenId) external view returns (address);

    function getVerificationStatus(
        uint256 tokenId
    ) external view returns (VerificationStatus);

    function getProjectType(uint256 tokenId) external view returns (ProjectType);

    function totalSupply() external view returns (uint256);

    // Events (must be declared in interface for external contracts to reference)
    event CarbonCreditMinted(
        uint256 indexed tokenId,
        address indexed generator,
        uint256 carbonAmount,
        ProjectType projectType
    );

    event CarbonCreditBurned(
        uint256 indexed tokenId,
        address indexed burner,
        uint256 carbonAmount
    );

    event CarbonCreditRetired(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 carbonAmount
    );

    event VerificationStatusUpdated(
        uint256 indexed tokenId,
        VerificationStatus oldStatus,
        VerificationStatus newStatus
    );
}
