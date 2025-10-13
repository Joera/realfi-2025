// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SurveyStore {
    struct Survey {
        string ipfsCid;
        string didNil;
        address owner;
        uint256 createdAt;
        bool exists;
    }
    
    // Mapping: owner address => survey name => Survey data
    mapping(address => mapping(string => Survey)) private surveys;
    
    // Events
    event SurveyCreated(
        address indexed owner,
        string surveyName,
        string ipfsCid,
        string didNil,
        uint256 timestamp
    );
    
    /**
     * @dev Create a new survey
     * @param surveyName Name of the survey
     * @param ipfsCid IPFS CID containing the survey questions JSON
     * @param didNil DID:NIL representing read access over the survey data
     */
    function createSurvey(
        string memory surveyName,
        string memory ipfsCid,
        string memory didNil
    ) external {
        require(bytes(surveyName).length > 0, "Survey name cannot be empty");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(bytes(didNil).length > 0, "DID:NIL cannot be empty");
        require(!surveys[msg.sender][surveyName].exists, "Survey already exists");
        
        surveys[msg.sender][surveyName] = Survey({
            ipfsCid: ipfsCid,
            didNil: didNil,
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
        
        emit SurveyCreated(msg.sender, surveyName, ipfsCid, didNil, block.timestamp);
    }
    
    /**
     * @dev Get survey IPFS CID
     * @param owner Address of the survey owner
     * @param surveyName Name of the survey
     * @return IPFS CID of the survey
     */
    function getSurveyCid(address owner, string memory surveyName) 
        external 
        view 
        returns (string memory) 
    {
        require(surveys[owner][surveyName].exists, "Survey does not exist");
        return surveys[owner][surveyName].ipfsCid;
    }
    
    /**
     * @dev Get survey DID:NIL
     * @param owner Address of the survey owner
     * @param surveyName Name of the survey
     * @return DID:NIL of the survey
     */
    function getSurveyDidNil(address owner, string memory surveyName) 
        external 
        view 
        returns (string memory) 
    {
        require(surveys[owner][surveyName].exists, "Survey does not exist");
        return surveys[owner][surveyName].didNil;
    }
    
    /**
     * @dev Get complete survey data
     * @param owner Address of the survey owner
     * @param surveyName Name of the survey
     * @return ipfsCid IPFS CID
     * @return didNil DID:NIL
     * @return surveyOwner Owner address
     * @return createdAt Creation timestamp
     */
    function getSurvey(address owner, string memory surveyName) 
        external 
        view 
        returns (
            string memory ipfsCid,
            string memory didNil,
            address surveyOwner,
            uint256 createdAt
        ) 
    {
        require(surveys[owner][surveyName].exists, "Survey does not exist");
        Survey memory survey = surveys[owner][surveyName];
        return (survey.ipfsCid, survey.didNil, survey.owner, survey.createdAt);
    }
    
    /**
     * @dev Check if an address is the owner of a survey (for Lit Protocol)
     * @param authSigAddress Address from the Lit Protocol auth signature
     * @param surveyName Name of the survey to check
     * @return bool True if the address owns the survey, false otherwise
     */
    function isOwner(address authSigAddress, string memory surveyName) 
        external 
        view 
        returns (bool) 
    {
        return surveys[authSigAddress][surveyName].exists;
    }
    
    /**
     * @dev Check if a survey exists
     * @param owner Address of the survey owner
     * @param surveyName Name of the survey
     * @return bool True if survey exists
     */
    function surveyExists(address owner, string memory surveyName) 
        external 
        view 
        returns (bool) 
    {
        return surveys[owner][surveyName].exists;
    }
}