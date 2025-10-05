// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonCreditNFT
 * @dev ERC-721 NFT contract for carbon credits on VeChain
 * @notice This contract tokenizes carbon credits as NFTs with rich metadata
 * @author VeChain Builders Hackathon Team
 */
contract CarbonCreditNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {

    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    // Enums
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

    enum BridgeStatus {
        None,
        Locked,
        Bridging,
        Unlocked,
        Failed
    }

    // Metadata structure for carbon credits
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
        BridgeStatus bridgeStatus;  // Cross-chain bridge status
        uint256 bridgeTransactionId; // Bridge transaction ID for tracking
        uint256 bridgeTimestamp;    // When bridge operation was initiated
    }

    // State variables
    uint256 private _tokenIdCounter;
    mapping(uint256 => CarbonCreditMetadata) private _creditMetadata;
    string private _baseTokenURI;
    
    // Bridge-related state
    mapping(uint256 => bool) private _lockedTokens; // tokenId => isLocked
    mapping(uint256 => address) private _bridgeRecipients; // tokenId => recipient on destination chain
    mapping(uint256 => uint256) private _bridgeChainIds; // tokenId => destination chain ID
    uint256 public totalBridgedTokens;
    uint256 public totalLockedTokens;

    // Events
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

    event TokenLocked(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed recipient,
        uint256 destinationChainId,
        uint256 bridgeTransactionId
    );

    event TokenUnlocked(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 sourceChainId,
        uint256 bridgeTransactionId
    );

    event BridgeStatusUpdated(
        uint256 indexed tokenId,
        BridgeStatus oldStatus,
        BridgeStatus newStatus,
        uint256 bridgeTransactionId
    );

    /**
     * @dev Constructor
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     * @param baseTokenURI The base URI for token metadata
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        
        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new carbon credit NFT
     * @param to The address to mint the NFT to
     * @param carbonAmount The amount of carbon in tonnes (wei precision)
     * @param location The geographic location of the carbon project
     * @param projectType The type of carbon project
     * @param proofsIPFSHash IPFS hash of verification documents
     * @param tokenURI The URI for the token metadata
     * @return The token ID of the minted NFT
     */
    function mintCarbonCredit(
        address to,
        uint256 carbonAmount,
        string memory location,
        ProjectType projectType,
        string memory proofsIPFSHash,
        string memory tokenURI
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(to != address(0), "CarbonCreditNFT: mint to zero address");
        require(carbonAmount > 0, "CarbonCreditNFT: carbon amount must be positive");
        require(bytes(location).length > 0, "CarbonCreditNFT: location cannot be empty");
        require(bytes(proofsIPFSHash).length > 0, "CarbonCreditNFT: IPFS hash cannot be empty");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Create metadata
        CarbonCreditMetadata memory metadata = CarbonCreditMetadata({
            creditId: tokenId,
            carbonAmount: carbonAmount,
            generatorAddress: to,
            location: location,
            verificationStatus: VerificationStatus.Pending,
            generationDate: block.timestamp,
            expiryDate: 0, // No expiry by default
            projectType: projectType,
            proofsIPFSHash: proofsIPFSHash,
            bridgeStatus: BridgeStatus.None,
            bridgeTransactionId: 0,
            bridgeTimestamp: 0
        });

        _creditMetadata[tokenId] = metadata;

        emit CarbonCreditMinted(tokenId, to, carbonAmount, projectType);
        return tokenId;
    }

    /**
     * @dev Burn a carbon credit NFT
     * @param tokenId The token ID to burn
     */
    function burnCarbonCredit(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        require(
            ownerOf(tokenId) == msg.sender || hasRole(BURNER_ROLE, msg.sender),
            "CarbonCreditNFT: caller is not owner or burner"
        );

        CarbonCreditMetadata memory metadata = _creditMetadata[tokenId];
        emit CarbonCreditBurned(tokenId, msg.sender, metadata.carbonAmount);

        // Delete metadata
        delete _creditMetadata[tokenId];

        _burn(tokenId);
    }

    /**
     * @dev Retire a carbon credit (mark as offset without burning)
     * @param tokenId The token ID to retire
     */
    function retireCarbonCredit(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        require(ownerOf(tokenId) == msg.sender, "CarbonCreditNFT: caller is not owner");

        CarbonCreditMetadata storage metadata = _creditMetadata[tokenId];
        require(
            metadata.verificationStatus == VerificationStatus.Verified,
            "CarbonCreditNFT: only verified credits can be retired"
        );

        VerificationStatus oldStatus = metadata.verificationStatus;
        metadata.verificationStatus = VerificationStatus.Retired;

        emit VerificationStatusUpdated(tokenId, oldStatus, VerificationStatus.Retired);
        emit CarbonCreditRetired(tokenId, msg.sender, metadata.carbonAmount);
    }

    /**
     * @dev Update verification status of a carbon credit
     * @param tokenId The token ID to update
     * @param newStatus The new verification status
     */
    function updateVerificationStatus(
        uint256 tokenId,
        VerificationStatus newStatus
    ) external onlyRole(MINTER_ROLE) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");

        CarbonCreditMetadata storage metadata = _creditMetadata[tokenId];
        VerificationStatus oldStatus = metadata.verificationStatus;
        metadata.verificationStatus = newStatus;

        emit VerificationStatusUpdated(tokenId, oldStatus, newStatus);
    }

    /**
     * @dev Get full metadata for a carbon credit
     * @param tokenId The token ID
     * @return The complete metadata struct
     */
    function getCreditMetadata(
        uint256 tokenId
    ) external view returns (CarbonCreditMetadata memory) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        return _creditMetadata[tokenId];
    }

    /**
     * @dev Get carbon amount for a token
     * @param tokenId The token ID
     * @return The carbon amount in tonnes
     */
    function getCarbonAmount(uint256 tokenId) external view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        return _creditMetadata[tokenId].carbonAmount;
    }

    /**
     * @dev Get generator address for a token
     * @param tokenId The token ID
     * @return The generator address
     */
    function getGeneratorAddress(uint256 tokenId) external view returns (address) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        return _creditMetadata[tokenId].generatorAddress;
    }

    /**
     * @dev Get verification status for a token
     * @param tokenId The token ID
     * @return The verification status
     */
    function getVerificationStatus(
        uint256 tokenId
    ) external view returns (VerificationStatus) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        return _creditMetadata[tokenId].verificationStatus;
    }

    /**
     * @dev Get project type for a token
     * @param tokenId The token ID
     * @return The project type
     */
    function getProjectType(uint256 tokenId) external view returns (ProjectType) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        return _creditMetadata[tokenId].projectType;
    }

    /**
     * @dev Get total supply of minted tokens
     * @return The total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Set base URI for token metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Override base URI
     * @return The base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Override tokenURI to handle both base URI and individual URIs
     * @param tokenId The token ID
     * @return The complete token URI
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override supportsInterface for multiple inheritance
     * @param interfaceId The interface ID to check
     * @return Whether the contract supports the interface
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl, ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }


    // Bridge functions
    /**
     * @dev Lock a token for cross-chain bridging
     * @param tokenId The token ID to lock
     * @param recipient The recipient address on the destination chain
     * @param destinationChainId The destination chain ID
     * @param bridgeTransactionId The bridge transaction ID for tracking
     */
    function lockTokenForBridge(
        uint256 tokenId,
        address recipient,
        uint256 destinationChainId,
        uint256 bridgeTransactionId
    ) external onlyRole(BRIDGE_ROLE) nonReentrant {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        require(!_lockedTokens[tokenId], "CarbonCreditNFT: token already locked");
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token not owned");
        require(recipient != address(0), "CarbonCreditNFT: invalid recipient address");
        require(destinationChainId != 0, "CarbonCreditNFT: invalid chain ID");

        // Update bridge status
        BridgeStatus oldStatus = _creditMetadata[tokenId].bridgeStatus;
        _creditMetadata[tokenId].bridgeStatus = BridgeStatus.Locked;
        _creditMetadata[tokenId].bridgeTransactionId = bridgeTransactionId;
        _creditMetadata[tokenId].bridgeTimestamp = block.timestamp;

        // Lock the token
        _lockedTokens[tokenId] = true;
        _bridgeRecipients[tokenId] = recipient;
        _bridgeChainIds[tokenId] = destinationChainId;
        totalLockedTokens++;

        emit TokenLocked(tokenId, ownerOf(tokenId), recipient, destinationChainId, bridgeTransactionId);
        emit BridgeStatusUpdated(tokenId, oldStatus, BridgeStatus.Locked, bridgeTransactionId);
    }

    /**
     * @dev Unlock a token after successful cross-chain bridging
     * @param tokenId The token ID to unlock
     * @param recipient The recipient address on this chain
     * @param sourceChainId The source chain ID
     * @param bridgeTransactionId The bridge transaction ID for tracking
     */
    function unlockTokenFromBridge(
        uint256 tokenId,
        address recipient,
        uint256 sourceChainId,
        uint256 bridgeTransactionId
    ) external onlyRole(BRIDGE_ROLE) nonReentrant {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        require(recipient != address(0), "CarbonCreditNFT: invalid recipient address");
        require(sourceChainId != 0, "CarbonCreditNFT: invalid chain ID");

        // Update bridge status
        BridgeStatus oldStatus = _creditMetadata[tokenId].bridgeStatus;
        _creditMetadata[tokenId].bridgeStatus = BridgeStatus.Unlocked;
        _creditMetadata[tokenId].bridgeTransactionId = bridgeTransactionId;
        _creditMetadata[tokenId].bridgeTimestamp = block.timestamp;

        // Unlock the token if it was locked
        if (_lockedTokens[tokenId]) {
            _lockedTokens[tokenId] = false;
            totalLockedTokens--;
        }

        // Transfer to recipient if not already owned by them
        if (ownerOf(tokenId) != recipient) {
            _transfer(ownerOf(tokenId), recipient, tokenId);
        }

        totalBridgedTokens++;

        emit TokenUnlocked(tokenId, recipient, sourceChainId, bridgeTransactionId);
        emit BridgeStatusUpdated(tokenId, oldStatus, BridgeStatus.Unlocked, bridgeTransactionId);
    }

    /**
     * @dev Update bridge status for a token
     * @param tokenId The token ID
     * @param newStatus The new bridge status
     * @param bridgeTransactionId The bridge transaction ID
     */
    function updateBridgeStatus(
        uint256 tokenId,
        BridgeStatus newStatus,
        uint256 bridgeTransactionId
    ) external onlyRole(BRIDGE_ROLE) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");

        BridgeStatus oldStatus = _creditMetadata[tokenId].bridgeStatus;
        _creditMetadata[tokenId].bridgeStatus = newStatus;
        _creditMetadata[tokenId].bridgeTransactionId = bridgeTransactionId;
        _creditMetadata[tokenId].bridgeTimestamp = block.timestamp;

        // Handle status-specific logic
        if (newStatus == BridgeStatus.Bridging) {
            // Token is in transit
        } else if (newStatus == BridgeStatus.Failed) {
            // Bridge failed, unlock if locked
            if (_lockedTokens[tokenId]) {
                _lockedTokens[tokenId] = false;
                totalLockedTokens--;
            }
        }

        emit BridgeStatusUpdated(tokenId, oldStatus, newStatus, bridgeTransactionId);
    }

    /**
     * @dev Check if a token is locked for bridging
     * @param tokenId The token ID to check
     * @return Whether the token is locked
     */
    function isTokenLocked(uint256 tokenId) external view returns (bool) {
        return _lockedTokens[tokenId];
    }

    /**
     * @dev Get bridge information for a token
     * @param tokenId The token ID
     * @return recipient The recipient address on destination chain
     * @return destinationChainId The destination chain ID
     * @return bridgeStatus The current bridge status
     * @return bridgeTransactionId The bridge transaction ID
     * @return bridgeTimestamp When bridge operation was initiated
     */
    function getBridgeInfo(uint256 tokenId) external view returns (
        address recipient,
        uint256 destinationChainId,
        BridgeStatus bridgeStatus,
        uint256 bridgeTransactionId,
        uint256 bridgeTimestamp
    ) {
        require(ownerOf(tokenId) != address(0), "CarbonCreditNFT: token does not exist");
        
        return (
            _bridgeRecipients[tokenId],
            _bridgeChainIds[tokenId],
            _creditMetadata[tokenId].bridgeStatus,
            _creditMetadata[tokenId].bridgeTransactionId,
            _creditMetadata[tokenId].bridgeTimestamp
        );
    }

    /**
     * @dev Get bridge statistics
     * @return totalBridged Total number of tokens that have been bridged
     * @return totalLocked Total number of tokens currently locked
     */
    function getBridgeStatistics() external view returns (uint256 totalBridged, uint256 totalLocked) {
        return (totalBridgedTokens, totalLockedTokens);
    }

    /**
     * @dev Override transfer functions to prevent transfers of locked tokens
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        require(!_lockedTokens[tokenId], "CarbonCreditNFT: cannot transfer locked token");
        return super._update(to, tokenId, auth);
    }
}
