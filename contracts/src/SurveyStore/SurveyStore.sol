// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title S3ntimentSurveyStore
 * @notice Stores surveys and validates anonymous survey card submissions.
 *
 * Card generation flow (off-chain):
 *   1. Survey owner signs a random seed once → derives an ephemeral batch wallet (one popup)
 *   2. Batch wallet address is registered on-chain via createSurvey() or registerBatch()
 *   3. Each card's nullifier is signed locally by the batch wallet (no further popups)
 *   4. Cards are printed as QR codes containing: nullifier, batchId, signature, surveyId
 *
 * Card submission flow (on-chain):
 *   1. validateCard() recovers the signer from the card's signature
 *   2. Verifies signer === registered batch wallet (batchId)
 *   3. Marks nullifier as used to prevent double submission
 *   4. Caller registers as participant via registerParticipant() using their survey-scoped child wallet
 *
 * Child wallet derivation (off-chain):
 *   1. User logs in once via WaaP → app-scoped master account
 *   2. Master account signs surveyId → signature used as vOPRF secret input
 *   3. vOPRF(salt=surveyId, secret=signature) → deterministic child private key
 *   4. Child wallet is unlinkable to master account and to other surveys
 *   5. Child wallet calls validateCard() + registerParticipant()
 *   6. Lit Protocol uses isParticipant() as access condition to gate response decryption
 *
 * Key design decisions:
 *   - batchId === batch wallet address — no separate UUID needed
 *   - Batch signers are immutable once registered — protects printed cards
 *   - Batches are scoped to a survey — a batch wallet cannot be reused across surveys
 *   - createSurvey() accepts an array of batchIds to minimize signatures in new survey flow
 *   - No events are emitted — storage is read directly by Lit and frontend
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
        uint256 cardCount;
    }

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    mapping(string => Survey) private surveys;
    mapping(address => string[]) private ownerSurveys;

    mapping(string => mapping(address => Batch)) private batches;
    mapping(string => address[]) private surveyBatchIds;

    mapping(bytes32 => bool) public usedNullifiers;

    mapping(string => mapping(address => bool)) private surveyParticipants;

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
    error AlreadyParticipant();
    error InvalidSignature();


    // =========================================================================
    // Survey management
    // =========================================================================

    /**
     * @dev Create a new survey with an optional initial set of batch wallets.
     *      Pass an empty array to create the survey without any batches.
     *
     * @param surveyId  Unique identifier, generated client-side
     * @param ipfsCid   IPFS content identifier for survey metadata
     * @param batchIds  Ephemeral batch wallet addresses. Pass [] to skip.
     */
    function createSurvey(
        string memory surveyId,
        string memory ipfsCid,
        address[] memory batchIds
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

        for (uint256 i = 0; i < batchIds.length; i++) {
            _registerBatch(surveyId, batchIds[i]);
        }
    }

    /**
     * @dev Update survey IPFS CID — survey content is mutable post-creation.
     */
    function updateSurvey(string memory surveyId, string memory newIpfsCid) external {
        Survey storage survey = surveys[surveyId];
        if (survey.owner != msg.sender) revert NotSurveyOwner();
        survey.ipfsCid = newIpfsCid;
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
     * @dev Register an additional batch for an existing survey.
     *
     * @param surveyId  Survey this batch belongs to
     * @param batchId   Ephemeral batch wallet address
     */
    function registerBatch(
        string memory surveyId,
        address batchId
    ) external {
        if (surveys[surveyId].owner != msg.sender) revert NotSurveyOwner();
        _registerBatch(surveyId, batchId);
    }

    function _registerBatch(
        string memory surveyId,
        address batchId
    ) internal {
        if (batchId == address(0)) revert InvalidBatchId();
        if (batches[surveyId][batchId].createdAt != 0) revert BatchAlreadyRegistered();

        batches[surveyId][batchId] = Batch({
            createdAt: block.timestamp,
            cardCount: 0
        });

        surveyBatchIds[surveyId].push(batchId);
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
     * @dev Validate a card submission.
     *      Called by the user's survey-scoped child wallet.
     *      Call registerParticipant() after this to register the child wallet.
     *
     * @param nullifier  Unique card identifier from QR code
     * @param signature  Signature produced by the ephemeral batch wallet
     * @param batchId    Batch wallet address this card belongs to
     * @param surveyId   Survey this card is for
     */

    function validateCard(
        string memory surveyId,
        string memory nullifier,
        address batchId,
        bytes memory signature
    ) external {
        if (surveys[surveyId].owner == address(0)) revert SurveyNotFound();
        if (batches[surveyId][batchId].createdAt == 0) revert BatchNotFound();
 
        bytes32 messageHash = keccak256(abi.encodePacked(nullifier, "|", batchId));
        bytes32 ethSignedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = recoverSigner(ethSignedHash, signature);
        
        if (signer != batchId) revert InvalidSignature();

        if (usedNullifiers[messageHash]) revert NullifierAlreadyUsed();

        usedNullifiers[messageHash] = true;
        batches[surveyId][batchId].cardCount++;

        if (!surveyParticipants[surveyId][msg.sender]) {
            surveyParticipants[surveyId][msg.sender] = true;
        }
    }

    function isNullifierUsed(string memory nullifier, address batchId) external view returns (bool) {
        bytes32 cardHash = keccak256(abi.encodePacked(nullifier, "|", batchId));
        return usedNullifiers[cardHash];
    }

    /**
     * @dev Check if an address is a registered participant for a survey.
     *      Used by Lit Protocol as an access condition.
     *
     * @param surveyId     Survey to check
     * @param participant  Address to check (survey-scoped child wallet)
     */
    function isParticipant(string memory surveyId, address participant) external view returns (bool) {
        return surveyParticipants[surveyId][participant];
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
