// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SurveyStore {
    struct Survey {
        string ipfsCid;
        address owner;
        uint256 createdAt;
    }
    
    mapping(address => mapping(string => Survey)) private surveys;
    
    event SurveyCreated(
        address indexed owner,
        string surveyId,
        string ipfsCid,
        uint256 timestamp
    );
    
    function createSurvey(
        string memory surveyId,
        string memory ipfsCid
    ) external {
        require(bytes(surveyId).length > 0, "Survey ID cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(surveys[msg.sender][surveyId].owner == address(0), "Survey already exists");
        
        surveys[msg.sender][surveyId] = Survey({
            ipfsCid: ipfsCid,
            owner: msg.sender,
            createdAt: block.timestamp
        });
        
        emit SurveyCreated(msg.sender, surveyId, ipfsCid, block.timestamp);
    }
    
    function getSurvey(address owner, string memory surveyId) 
        external 
        view 
        returns (string memory ipfsCid, address surveyOwner, uint256 createdAt) 
    {
        require(surveys[owner][surveyId].owner != address(0), "Survey does not exist");
        Survey memory survey = surveys[owner][surveyId];
        return (survey.ipfsCid, survey.owner, survey.createdAt);
    }
    
    function isOwner(address authSigAddress, string memory surveyId) 
        external 
        view 
        returns (bool) 
    {
        return surveys[authSigAddress][surveyId].owner != address(0);
    }
    
    function surveyExists(address owner, string memory surveyId) 
        external 
        view 
        returns (bool) 
    {
        return surveys[owner][surveyId].owner != address(0);
    }
}