// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title S3ntimentSurveyStore
 * @notice Stores surveys and validates anonymous survey card submissions.
 *
 * Card generation flow (off-chain):
 *   1. Survey owner signs a random seed once → derives an ephemeral batch wallet (one popup)
 *   2. Batch wallet address is registered on-chain as the batchId via registerBatch()
 *   3. Each card's nullifier is signed locally by the batch wallet (no further popups)
 *   4. Cards are printed as QR codes containing: nullifier, batchId, signature, surveyId
 *
 * Card submission flow (on-chain):
 *   1. validateCard() recovers the signer from the card's signature
 *   2. Verifies signer === registered batch wallet (batchId)
 *   3. Marks nullifier as used to prevent double submission
 *
 * Key design decisions:
 *   - batchId === batch wallet address — no separate UUID needed
 *   - Batch signers are immutable once registered — protects printed cards
 *   - Batches are scoped to a survey — a batch wallet cannot be reused across surveys
 */
contract S3ntimentSurveyStore {

    // -------------------------------------------------------------------------
    // Data structures
    // -------------------------------------------------------------------------

    struct Survey {
        string ipfsCid;
        address owner;
        uint256 createdAt;
    }

    struct Batch {
        uint256 createdAt;
        uint256 cardCount; // number of validated cards from this batch
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    // Survey storage
    mapping(string => Survey) private surveys;
    mapping(address => string[]) private ownerSurveys;

    // Batch storage — batchId is the ephemeral wallet address
    mapping(string => mapping(address => Batch)) private batches; // surveyId -> batchId -> Batch
    mapping(string => address[]) private surveyBatchIds;          // surveyId -> batchId[]

    // Nullifier tracking
    mapping(bytes32 => bool) public usedNullifiers;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event SurveyCreated(address indexed owner, string surveyId, string ipfsCid, uint256 timestamp);
    event SurveyUpdated(string surveyId, string newIpfsCid);
    event BatchRegistered(string indexed surveyId, address indexed batchId, uint256 timestamp);
    event CardValidated(string indexed surveyId, address indexed batchId, string nullifier, uint256 newCount);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error SurveyNotFound();
    error SurveyAlreadyExists();
    error NotSurveyOwner();
    error BatchNotFound();
    error BatchAlreadyRegistered();
    error InvalidBatchId();
    error NullifierAlreadyUsed();
    error SignerNotBatchWallet();

    // =========================================================================
    // Survey management
    // =========================================================================

    /**
     * @dev Create a new survey with a globally unique ID (generated client-side)
     * @param surveyId Unique identifier (UUID or composite)
     * @param ipfsCid IPFS content identifier for survey metadata
     */
    function createSurvey(
        string memory surveyId,
        string memory ipfsCid
    ) external {
        require(bytes(surveyId).length > 0, "Survey ID cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");

        if (surveys[surveyId].owner != address(0)) revert SurveyAlreadyExists();

        surveys[surveyId] = Survey({
            ipfsCid: ipfsCid,
            owner: msg.sender,
            createdAt: block.timestamp
        });

        ownerSurveys[msg.sender].push(surveyId);

        emit SurveyCreated(msg.sender, surveyId, ipfsCid, block.timestamp);
    }

    /**
     * @dev Update survey IPFS CID — survey content is mutable post-creation
     */
    function updateSurvey(string memory surveyId, string memory newIpfsCid) external {
        Survey storage survey = surveys[surveyId];
        if (survey.owner != msg.sender) revert NotSurveyOwner();
        survey.ipfsCid = newIpfsCid;
        emit SurveyUpdated(surveyId, newIpfsCid);
    }

    function getSurvey(string memory surveyId)
        external
        view
        returns (string memory ipfsCid, address owner, uint256 createdAt)
    {
        Survey memory survey = surveys[surveyId];
        if (survey.owner == address(0)) revert SurveyNotFound();
        return (survey.ipfsCid, survey.owner, survey.createdAt);
    }

    function surveyExists(string memory surveyId) external view returns (bool) {
        return surveys[surveyId].owner != address(0);
    }

    function isOwner(address authSigAddress, string memory surveyId) external view returns (bool) {
        return surveys[surveyId].owner == authSigAddress;
    }

    function getOwnerSurveys(address owner) external view returns (string[] memory) {
        return ownerSurveys[owner];
    }

    function getOwnerSurveyCount(address owner) external view returns (uint256) {
        return ownerSurveys[owner].length;
    }

    // =========================================================================
    // Batch management
    // =========================================================================

    /**
     * @dev Register a new card batch for a survey.
     *
     *      The batchId is the address of an ephemeral wallet derived off-chain
     *      from a single owner signature. This allows all cards in the batch to
     *      be signed locally without per-card wallet popups, while keeping
     *      on-chain verification trustless.
     *
     *      Batches are immutable once registered — this protects already-printed
     *      cards from being invalidated by the survey owner.
     *
     * @param surveyId Survey this batch belongs to
     * @param batchId  Ephemeral batch wallet address (also serves as the batch identifier)
     */
    function registerBatch(
        string memory surveyId,
        address batchId
    ) external {
        if (surveys[surveyId].owner != msg.sender) revert NotSurveyOwner();
        if (batchId == address(0)) revert InvalidBatchId();
        if (batches[surveyId][batchId].createdAt != 0) revert BatchAlreadyRegistered();

        batches[surveyId][batchId] = Batch({
            createdAt: block.timestamp,
            cardCount: 0
        });

        surveyBatchIds[surveyId].push(batchId);

        emit BatchRegistered(surveyId, batchId, block.timestamp);
    }

    function getBatch(string memory surveyId, address batchId)
        external
        view
        returns (uint256 createdAt, uint256 cardCount)
    {
        Batch memory batch = batches[surveyId][batchId];
        if (batch.createdAt == 0) revert BatchNotFound();
        return (batch.createdAt, batch.cardCount);
    }

    function getSurveyBatches(string memory surveyId) external view returns (address[] memory) {
        return surveyBatchIds[surveyId];
    }

    function getBatchCardCount(string memory surveyId, address batchId) external view returns (uint256) {
        return batches[surveyId][batchId].cardCount;
    }

    // =========================================================================
    // Card validation
    // =========================================================================

    /**
     * @dev Validate a card and record the submission.
     *
     *      Verifies that the nullifier was signed by the registered batch wallet,
     *      ensuring only legitimately printed cards can be submitted.
     *      Each card can only be submitted once.
     *
     * @param nullifier Unique card identifier from QR code
     * @param signature Signature produced by the ephemeral batch wallet
     * @param batchId   Batch wallet address this card belongs to
     * @param surveyId  Survey this card is for
     */
    function validateCard(
        string memory nullifier,
        bytes memory signature,
        address batchId,
        string memory surveyId
    ) external returns (bool) {
        if (surveys[surveyId].owner == address(0)) revert SurveyNotFound();

        Batch storage batch = batches[surveyId][batchId];
        if (batch.createdAt == 0) revert BatchNotFound();

        // Reconstruct signed message — must match card generation:
        // message = `${nullifier}|${batchId}`
        string memory message = string(abi.encodePacked(nullifier, "|", batchId));
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));

        // Recover signer and verify it matches the registered batch wallet (batchId)
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        if (recoveredSigner != batchId) revert SignerNotBatchWallet();

        // Each nullifier can only be used once
        if (usedNullifiers[messageHash]) revert NullifierAlreadyUsed();

        usedNullifiers[messageHash] = true;
        batch.cardCount++;

        emit CardValidated(surveyId, batchId, nullifier, batch.cardCount);

        return true;
    }

    /**
     * @dev Check if a specific nullifier has already been used
     */
    function isNullifierUsed(string memory nullifier, address batchId) external view returns (bool) {
        bytes32 cardHash = keccak256(abi.encodePacked(nullifier, "|", batchId));
        return usedNullifiers[cardHash];
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

    function recoverSigner(bytes32 messageHash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature recovery value");

        return ecrecover(messageHash, v, r, s);
    }
}
