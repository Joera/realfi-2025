// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract S3ntimentSurveyStore {
    struct Survey {
        string ipfsCid;
        address owner;
        uint256 createdAt;
    }
    
    // Global survey lookup by unique ID
    mapping(string => Survey) private surveys;
    
    // Owner's survey list (for enumeration)
    mapping(address => string[]) private ownerSurveys;
    
    // Card validation storage (nested by surveyId)
    mapping(string => mapping(string => uint256)) public batchCardCount; // surveyId -> batchId -> count
    mapping(bytes32 => bool) public usedNullifiers;
    
    // Events
    event SurveyCreated(
        address indexed owner,
        string surveyId,
        string ipfsCid,
        uint256 timestamp
    );

    event SurveyUpdated(
        string surveyId, 
        string newIpfsCid
    );

    event CardValidated(
        string indexed surveyId,
        string indexed batchId,
        uint256 newCount
    );
    

    // Errors
    error InvalidSignature();
    error NullifierAlreadyUsed();
    error SurveyNotFound();
    error SignerNotSurveyOwner();
    error SurveyAlreadyExists();
    
    /**
     * @dev Create a new survey with globally unique ID (generated client-side)
     * @param surveyId Unique identifier (UUID or composite)
     * @param ipfsCid IPFS content identifier for survey metadata
     */
    function createSurvey(
        string memory surveyId,
        string memory ipfsCid
    ) external {
        require(bytes(surveyId).length > 0, "Survey ID cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        
        if (surveys[surveyId].owner != address(0)) {
            revert SurveyAlreadyExists();
        }
        
        surveys[surveyId] = Survey({
            ipfsCid: ipfsCid,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        // Add to owner's list
        ownerSurveys[msg.sender].push(surveyId);
        
        emit SurveyCreated(msg.sender, surveyId, ipfsCid, block.timestamp);
    }

    function updateSurveyCid(string memory surveyId, string memory newIpfsCid) external {
        Survey storage survey = surveys[surveyId];
        require(survey.owner == msg.sender, "Not owner");
        survey.ipfsCid = newIpfsCid;
        emit SurveyUpdated(surveyId, newIpfsCid);
    }
    
    /**
     * @dev Validate card signature and check it was signed by survey owner
     * @param nullifier Unique card identifier from QR code
     * @param signature Signature generated during card creation
     * @param batchId Batch identifier for this set of cards
     * @param surveyId Survey identifier
     */
    function validateCard(
        string memory nullifier,
        bytes memory signature,
        string memory batchId,
        string memory surveyId
    ) external returns (bool) {
        Survey memory survey = surveys[surveyId];
        if (survey.owner == address(0)) {
            revert SurveyNotFound();
        }
        
        // Reconstruct message (plain string)
        string memory message = string(abi.encodePacked(nullifier, "|", batchId));
        bytes memory messageBytes = bytes(message);
        
        // EIP-191: prefix + length + message
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n",
            toString(messageBytes.length),
            message
        ));
        
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        
        if (recoveredSigner != survey.owner) {
            revert SignerNotSurveyOwner();
        }
        
        // Use message hash for nullifier tracking (not the signed hash)
        bytes32 nullifierHash = keccak256(messageBytes);
        if (usedNullifiers[nullifierHash]) {
            revert NullifierAlreadyUsed();
        }
        
        usedNullifiers[nullifierHash] = true;
        batchCardCount[surveyId][batchId]++;
        
        emit CardValidated(surveyId, batchId, batchCardCount[surveyId][batchId]);
    
        
        return true;
    }
    
    /**
     * @dev Get all survey IDs owned by an address
     * @param owner Address to query
     * @return Array of survey IDs (does not reveal survey content)
     */
    function getOwnerSurveys(address owner) 
        external 
        view 
        returns (string[] memory) 
    {
        return ownerSurveys[owner];
    }
    
    /**
     * @dev Get number of surveys owned by an address
     * @param owner Address to query
     * @return Number of surveys
     */
    function getOwnerSurveyCount(address owner) 
        external 
        view 
        returns (uint256) 
    {
        return ownerSurveys[owner].length;
    }
    
    /**
     * @dev Get survey details by ID
     * @param surveyId Survey identifier
     * @return ipfsCid IPFS content ID
     * @return owner Survey owner address
     * @return createdAt Creation timestamp
     */
    function getSurvey(string memory surveyId) 
        external 
        view 
        returns (string memory ipfsCid, address owner, uint256 createdAt) 
    {
        Survey memory survey = surveys[surveyId];
        if (survey.owner == address(0)) {
            revert SurveyNotFound();
        }
        return (survey.ipfsCid, survey.owner, survey.createdAt);
    }
    
    /**
     * @dev Check if a survey exists
     * @param surveyId Survey identifier
     * @return True if survey exists
     */
    function surveyExists(string memory surveyId) 
        external 
        view 
        returns (bool) 
    {
        return surveys[surveyId].owner != address(0);
    }

        /**
    * @dev Check if an address owns a specific survey
    * @param authSigAddress Address to check
    * @param surveyId Survey identifier
    * @return True if address owns the survey
    */
    function isOwner(address authSigAddress, string memory surveyId) 
        external 
        view 
        returns (bool) 
    {
        return surveys[surveyId].owner == authSigAddress;
    }
    
    /**
     * @dev Get number of cards used from a specific batch
     * @param surveyId Survey identifier
     * @param batchId Batch identifier
     * @return Number of cards validated from this batch
     */
    function getBatchCount(string memory surveyId, string memory batchId) 
        external 
        view 
        returns (uint256) 
    {
        return batchCardCount[surveyId][batchId];
    }
    
    /**
     * @dev Check if a specific card has been used
     * @param nullifier Card nullifier
     * @param batchId Batch identifier
     * @return True if card has been used
     */
    function isNullifierUsed(string memory nullifier, string memory batchId) 
        external 
        view 
        returns (bool) 
    {
        bytes32 cardHash = keccak256(abi.encodePacked(nullifier, "|", batchId));
        return usedNullifiers[cardHash];
    }
    
    /**
     * @dev Recover signer address from signature
     * @param messageHash Hash of the signed message
     * @param signature Signature bytes (r, s, v)
     * @return Address that created the signature
     */
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
        
        // Handle legacy signature format
        if (v < 27) {
            v += 27;
        }
        
        require(v == 27 || v == 28, "Invalid signature recovery value");
        
        return ecrecover(messageHash, v, r, s);
    }

    // Helper: uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}