export declare const Artifact_Proxy: {
  "contractName": "Proxy",
  "sourceName": "solc_0_8/ERC1967/Proxy.sol",
  "abi": [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousImplementation",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newImplementation",
          "type": "address"
        }
      ],
      "name": "ProxyImplementationUpdated",
      "type": "event"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    }
  ],
  "bytecode": "0x",
  "deployedBytecode": "0x",
  "linkReferences": {},
  "deployedLinkReferences": {},
  "immutableReferences": {},
  "inputSourceName": "project/solc_0_8/ERC1967/Proxy.sol",
  "devdoc": {
    "kind": "dev",
    "methods": {},
    "version": 1
  },
  "evm": {
    "bytecode": {
      "functionDebugData": {},
      "generatedSources": [],
      "linkReferences": {},
      "object": "",
      "opcodes": "",
      "sourceMap": ""
    },
    "deployedBytecode": {
      "functionDebugData": {},
      "generatedSources": [],
      "immutableReferences": {},
      "linkReferences": {},
      "object": "",
      "opcodes": "",
      "sourceMap": ""
    },
    "gasEstimates": null,
    "methodIdentifiers": {}
  },
  "metadata": "{\"compiler\":{\"version\":\"0.8.20+commit.a1b79de6\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousImplementation\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newImplementation\",\"type\":\"address\"}],\"name\":\"ProxyImplementationUpdated\",\"type\":\"event\"},{\"stateMutability\":\"payable\",\"type\":\"fallback\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}],\"devdoc\":{\"kind\":\"dev\",\"methods\":{},\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{},\"version\":1}},\"settings\":{\"compilationTarget\":{\"project/solc_0_8/ERC1967/Proxy.sol\":\"Proxy\"},\"evmVersion\":\"shanghai\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\",\"useLiteralContent\":true},\"optimizer\":{\"enabled\":true,\"runs\":999999},\"remappings\":[]},\"sources\":{\"project/solc_0_8/ERC1967/Proxy.sol\":{\"content\":\"// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.0;\\n\\n// ERC-1967\\nabstract contract Proxy {\\n    // --------------------------------------------------------------------------------------------\\n    // Events\\n    // --------------------------------------------------------------------------------------------\\n\\n    event ProxyImplementationUpdated(address indexed previousImplementation, address indexed newImplementation);\\n\\n    // --------------------------------------------------------------------------------------------\\n    // Public Interface\\n    // --------------------------------------------------------------------------------------------\\n\\n    receive() external payable virtual {\\n        revert(\\\"ETHER_REJECTED\\\"); // explicit reject by default\\n    }\\n\\n    fallback() external payable {\\n        _fallback();\\n    }\\n\\n    // --------------------------------------------------------------------------------------------\\n    // Internal\\n    // --------------------------------------------------------------------------------------------\\n\\n    function _fallback() internal {\\n        // solhint-disable-next-line security/no-inline-assembly\\n        assembly {\\n            let implementationAddress := sload(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc)\\n            calldatacopy(0x0, 0x0, calldatasize())\\n            let success := delegatecall(gas(), implementationAddress, 0x0, calldatasize(), 0, 0)\\n            let retSz := returndatasize()\\n            returndatacopy(0, 0, retSz)\\n            switch success\\n            case 0 { revert(0, retSz) }\\n            default { return(0, retSz) }\\n        }\\n    }\\n\\n    function _setImplementation(address newImplementation, bytes memory data) internal {\\n        address previousImplementation;\\n        // solhint-disable-next-line security/no-inline-assembly\\n        assembly {\\n            previousImplementation := sload(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc)\\n        }\\n\\n        // solhint-disable-next-line security/no-inline-assembly\\n        assembly {\\n            sstore(0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc, newImplementation)\\n        }\\n\\n        emit ProxyImplementationUpdated(previousImplementation, newImplementation);\\n\\n        if (data.length > 0) {\\n            (bool success,) = newImplementation.delegatecall(data);\\n            if (!success) {\\n                assembly {\\n                    // This assembly ensure the revert contains the exact string data\\n                    let returnDataSize := returndatasize()\\n                    returndatacopy(0, 0, returnDataSize)\\n                    revert(0, returnDataSize)\\n                }\\n            }\\n        }\\n    }\\n}\\n\",\"keccak256\":\"0x7b91e396821b404ffd824b60396d4f561acb5e7e8ce611b5444dfe503cc693e4\",\"license\":\"MIT\"}},\"version\":1}",
  "storageLayout": {
    "storage": [],
    "types": null
  },
  "userdoc": {
    "kind": "user",
    "methods": {},
    "version": 1
  }
};