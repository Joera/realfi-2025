// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SurveyStore {
    struct Survey {
        string ipfsCid;
        string didNil;
        string encryptedNilKey;
        address owner;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(address => mapping(string => Survey)) private surveys;
    
    event SurveyCreated(
        address indexed owner,
        string surveyId,
        string ipfsCid,
        string didNil,
        string encryptedNilKey,
        uint256 timestamp
    );
    
    function createSurvey(
        string memory surveyId,
        string memory ipfsCid,
        string memory didNil,
        string memory encryptedNilKey
    ) external {
        require(bytes(surveyId).length > 0, "Survey ID cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(bytes(didNil).length > 0, "DID:NIL cannot be empty");
        require(bytes(encryptedNilKey).length > 0, "Encrypted Nillion key cannot be empty");
        require(!surveys[msg.sender][surveyId].exists, "Survey already exists");
        
        surveys[msg.sender][surveyId] = Survey({
            ipfsCid: ipfsCid,
            didNil: didNil,
            encryptedNilKey: encryptedNilKey,
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        emit SurveyCreated(msg.sender, surveyId, ipfsCid, didNil, encryptedNilKey, block.timestamp);
    }
    
    function getSurvey(address owner, string memory surveyId) 
        external 
        view 
        returns (
            string memory ipfsCid,
            string memory didNil,
            string memory encryptedNilKey,
            address surveyOwner,
            uint256 createdAt
        ) 
    {
        require(surveys[owner][surveyId].exists, "Survey does not exist");
        Survey memory survey = surveys[owner][surveyId];
        return (survey.ipfsCid, survey.didNil, survey.encryptedNilKey, survey.owner, survey.createdAt);
    }
    
    function isOwner(address authSigAddress, string memory surveyId) 
        external 
        view 
        returns (bool) 
    {
        return surveys[authSigAddress][surveyId].exists;
    }
    
    function surveyExists(address owner, string memory surveyId) 
        external 
        view 
        returns (bool) 
    {
        return surveys[owner][surveyId].exists;
    }
}