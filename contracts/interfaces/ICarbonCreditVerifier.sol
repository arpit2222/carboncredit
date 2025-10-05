// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICarbonCreditVerifier
 * @dev Interface for CarbonCreditVerifier contract to enable clean integration with other contracts
 * @notice This interface will be used by frontend applications, bridge contracts, and other integrations
 * @author VeChain Builders Hackathon Team
 */
interface ICarbonCreditVerifier {
    // Enums (must be redeclared in interface)
    enum VerificationStatus {
        Submitted,
        UnderReview,
        Approved,
        Rejected,
        Issued,
        Cancelled
    }

    enum VerificationStage {
        InitialSubmission,
        TechnicalReview,
        FieldVerification,
        FinalApproval,
        Issuance
    }

    // Structs (must be redeclared in interface)
    struct VerificationRequest {
        uint256 requestId;                    // Unique request identifier
        address submitter;                    // Address that submitted the request
        uint256 farmerId;                     // Farmer ID from FarmerRegistry
        uint256 orgId;                        // Organization ID from OrganizationRegistry (0 if individual)
        uint256 carbonAmount;                 // Amount of carbon in tonnes (wei precision)
        string location;                      // Geographic location of the project
        uint8 projectType;                    // Type of carbon project (enum as uint8)
        string projectDescription;            // Detailed project description
        string technicalDocumentsHash;        // IPFS hash of technical documents
        string fieldEvidenceHash;             // IPFS hash of field evidence/photos
        string monitoringPlanHash;            // IPFS hash of monitoring plan
        VerificationStatus status;            // Current verification status
        VerificationStage currentStage;       // Current verification stage
        uint256 submissionDate;               // Unix timestamp of submission
        uint256 lastUpdated;                  // Unix timestamp of last update
        uint256 reviewDeadline;               // Unix timestamp of review deadline
        address assignedVerifier;             // Verifier assigned to this request
        address assignedApprover;             // Approver assigned to this request
        string rejectionReason;               // Reason for rejection (if applicable)
        uint256 issuedTokenId;                // Token ID of issued NFT (0 if not issued)
        bool isActive;                        // Whether the request is active
    }

    struct VerifierProfile {
        address verifierAddress;              // Verifier wallet address
        string name;                          // Verifier name
        string credentials;                   // Verifier credentials/certifications
        uint256 totalVerified;                // Total credits verified by this verifier
        uint256 activeRequests;               // Number of active requests assigned
        bool isActive;                        // Whether verifier is active
        uint256 registrationDate;             // Unix timestamp of registration
    }

    // Function signatures (external functions only)
    function submitVerificationRequest(
        uint256 farmerId,
        uint256 orgId,
        uint256 carbonAmount,
        string memory location,
        uint8 projectType,
        string memory projectDescription,
        string memory technicalDocumentsHash,
        string memory fieldEvidenceHash,
        string memory monitoringPlanHash
    ) external returns (uint256);

    function assignVerifier(
        uint256 requestId,
        address verifierAddress,
        VerificationStage stage
    ) external;

    function updateVerificationStage(
        uint256 requestId,
        VerificationStage newStage,
        string memory comments
    ) external;

    function approveVerificationRequest(
        uint256 requestId,
        string memory tokenURI
    ) external;

    function rejectVerificationRequest(
        uint256 requestId,
        string memory reason
    ) external;

    function cancelVerificationRequest(
        uint256 requestId
    ) external;

    function registerVerifier(
        address verifierAddress,
        string memory name,
        string memory credentials
    ) external;

    function setVerifierStatus(
        address verifierAddress,
        bool isActive
    ) external;

    // View functions
    function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory);

    function getVerifierProfile(address verifierAddress) external view returns (VerifierProfile memory);

    function getActiveRequestIds() external view returns (uint256[] memory);

    function getVerifierRequests(address verifierAddress) external view returns (uint256[] memory);

    function getSubmitterRequests(address submitterAddress) external view returns (uint256[] memory);

    function getTotalRequests() external view returns (uint256);

    function isVerifierActive(address verifierAddress) external view returns (bool);

    function getRequestStatus(uint256 requestId) external view returns (VerificationStatus);

    function getRequestStage(uint256 requestId) external view returns (VerificationStage);

    function isRequestOverdue(uint256 requestId) external view returns (bool);

    // Events (must be declared in interface for external contracts to reference)
    event VerificationRequestSubmitted(
        uint256 indexed requestId,
        address indexed submitter,
        uint256 farmerId,
        uint256 orgId,
        uint256 carbonAmount,
        uint8 projectType
    );

    event VerificationRequestUpdated(
        uint256 indexed requestId,
        VerificationStage oldStage,
        VerificationStage newStage,
        address indexed updater
    );

    event VerificationRequestApproved(
        uint256 indexed requestId,
        address indexed approver,
        uint256 carbonAmount
    );

    event VerificationRequestRejected(
        uint256 indexed requestId,
        address indexed rejector,
        string reason
    );

    event CarbonCreditIssued(
        uint256 indexed requestId,
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 carbonAmount
    );

    event VerifierRegistered(
        address indexed verifierAddress,
        string name,
        string credentials
    );

    event VerifierAssigned(
        uint256 indexed requestId,
        address indexed verifier,
        VerificationStage stage
    );

    event VerifierDeactivated(
        address indexed verifierAddress,
        bool isActive
    );
}
