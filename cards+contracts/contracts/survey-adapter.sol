// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./survey-store.sol"; // import your existing contract

contract SurveyAdapter {
    SurveyStore public surveyStore;

    constructor(address surveyStoreAddress) {
        surveyStore = SurveyStore(surveyStoreAddress);
    }

    // ERC721-like balanceOf: returns 1 if the user owns this survey, else 0
    function balanceOf(address user, string memory surveyId) external view returns (uint256) {
        bool owns = surveyStore.isOwner(user, surveyId);
        return owns ? 1 : 0;
    }
}
