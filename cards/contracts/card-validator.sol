// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CardValidator {
    address public publicKey;
    address public owner;
    
    // Track card usage per batch
    mapping(string => uint256) public batchCardCount;
    mapping(bytes32 => bool) public usedNullifiers;
    
    event PublicKeySet(address indexed newPublicKey);
    event SignatureValidated(address indexed signer, bytes32 messageHash);
    event CardValidated(string indexed batchId, string nullifier, uint256 newCount);

    error InvalidSignature();
    error NullifierAlreadyUsed();
    error InvalidPublicKey();
    
    constructor(address _initialPublicKey) {
        owner = msg.sender;
        publicKey = _initialPublicKey;
        emit PublicKeySet(_initialPublicKey);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Set the public key (address) for signature validation
     * @param _publicKey The Ethereum address derived from the public key
     */
    function setPublicKey(address _publicKey) external onlyOwner {
        require(_publicKey != address(0), "Public key cannot be zero address");
        publicKey = _publicKey;
        emit PublicKeySet(_publicKey);
    }
    
    /**
     * @dev Get the current public key
     * @return The current public key address
     */
    function getPublicKey() external view returns (address) {
        return publicKey;
    }

    // Add custom errors for better debugging


    function validateCard(
        string memory nullifier,
        bytes memory signature,
        string memory batchId
    ) external returns (bool) {
        string memory message = string(abi.encodePacked(nullifier, "|", batchId));
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32", 
            messageHash
        ));
        
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);
        if (recoveredSigner != publicKey) revert InvalidSignature();
        
        // Check if nullifier already used for this batch
        if (usedNullifiers[messageHash]) revert NullifierAlreadyUsed();
        
        // Mark nullifier as used
        usedNullifiers[messageHash] = true;
        
        // Increment batch counter
        batchCardCount[batchId]++;
        
        emit CardValidated(batchId, nullifier, batchCardCount[batchId]);
        emit SignatureValidated(recoveredSigner, ethSignedMessageHash);
        
        return true;
    }
    
    /**
     * @dev Get the count of used cards for a specific batch
     * @param batchId The batch identifier
     * @return Number of cards used from this batch
     */
    function getBatchCount(string memory batchId) external view returns (uint256) {
        return batchCardCount[batchId];
    }
    
    /**
     * @dev Check if a specific nullifier has been used for a batch
     * @param nullifier The card nullifier
     * @param batchId The batch identifier
     * @return true if nullifier has been used
     */
    function isNullifierUsed(string memory nullifier, string memory batchId) external view returns (bool) {
        bytes32 cardHash = keccak256(abi.encodePacked(nullifier, "|", batchId));
        return usedNullifiers[cardHash];
    }
    
    /**
     * @dev Internal function to recover signer from signature
     * @param messageHash Hash of the signed message
     * @param signature Signature bytes (r, s, v)
     * @return Address of the signer
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
    
    /**
     * @dev View function to check if signature is valid without state changes
     * @param messageHash The hash of the original message
     * @param signature The signature bytes
     * @return true if signature is valid
     */
    function isValidSignature(bytes32 messageHash, bytes memory signature) 
        external 
        view 
        returns (bool) 
    {
        address recoveredSigner = recoverSigner(messageHash, signature);
        return recoveredSigner == publicKey;
    }
    
    /**
     * @dev Transfer ownership to new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}