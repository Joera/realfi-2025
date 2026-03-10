const surveyOwner = (surveyId: string, contract: string, safeAddress: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isOwner",
  functionParams: [safeAddress, surveyId],
  functionAbi: {
    type: "function",
    name: "isOwner",
    stateMutability: "view",
    inputs: [
      { name: "authSigAddress", type: "address" },
      { name: "surveyId", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});

const isRespondent = (contract: string, surveyId: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isRespondent",
  functionParams: [surveyId, ":userAddress"],
  functionAbi: {
    type: "function",
    name: "isRespondent",
    stateMutability: "view",
    inputs: [
      { name: "surveyId", type: "string" },
      { name: "respondent", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});


// const isOwnerOFSMC = (smartAccountAddress: string) => ({

//     conditionType: "evmContract" as const,
//     contractAddress: smartAccountAddress,
//     chain: "base" as const,
//     functionName: "owner",
//     functionParams: [],
//     functionAbi: {
//       type: "function",
//       name: "owner",
//       stateMutability: "view",
//       inputs: [],
//       outputs: [{ name: "", type: "address" }],
//     },
//     returnValueTest: {
//       key: "",
//       comparator: "=" as const,
//       value: ":userAddress",
//     }
// })

const isOwnerOfSafe = (safeAddress: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: safeAddress,
  chain: "base" as const,
  functionName: "isOwner",
  functionParams: [":userAddress"],
  functionAbi: {
    type: "function",
    name: "isOwner",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  }
})

export const accsForSurveyOwner = (surveyId: string, contract: string, safeAddress: string) => {
  return [surveyOwner(surveyId, contract, safeAddress), { operator: "and" }, isOwnerOfSafe(safeAddress)];
};

export const accsForRespondent = (contract: string, surveyId: string) => {
  return [isRespondent(contract, surveyId)];
};


export const alwaysTrue =  [
  {
    conditionType: "evmBasic" as const,
    contractAddress: "",
    standardContractType: "" as const,
    chain: "base" as const,
    method: "",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: "=" as const,
      value: ":userAddress",
    },
  }
];
