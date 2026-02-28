const surveyOwner = (surveyId: string, contract: string, smartAccountAddress: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isOwner",
  functionParams: [smartAccountAddress, surveyId],
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

const isParticipant = (contract: string, surveyId: string, smartAccountAddress: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isParticipant",
  functionParams: [surveyId, smartAccountAddress],
  functionAbi: {
    type: "function",
    name: "isParticipant",
    stateMutability: "view",
    inputs: [
      { name: "surveyId", type: "string" },
      { name: "participant", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});


const isOwnerOFSMC = (smartAccountAddress: string) => ({

    conditionType: "evmContract" as const,
    contractAddress: smartAccountAddress,
    chain: "base" as const,
    functionName: "owner",
    functionParams: [],
    functionAbi: {
      type: "function",
      name: "owner",
      stateMutability: "view",
      inputs: [],
      outputs: [{ name: "", type: "address" }],
    },
    returnValueTest: {
      key: "",
      comparator: "=" as const,
      value: ":userAddress",
    }
})

export const accsForSurveyOwner = (surveyId: string, contract: string, smartAccountAddress: string) => {
  return [surveyOwner(surveyId, contract, smartAccountAddress), { operator: "and" }, isOwnerOFSMC(smartAccountAddress)];
};

export const accsForUser = (contract: string, surveyId: string, smartAccountAddress: string) => {
  return [isParticipant(contract, surveyId, smartAccountAddress), { operator: "and" }, isOwnerOFSMC(smartAccountAddress)];
};

export const accsForOwnerOrUser = (surveyId: string, contract: string, smartAccountAddress: string) => {
  console.log("params used for acc", [surveyId, contract, smartAccountAddress]);
  return [surveyOwner(surveyId, contract, smartAccountAddress), { operator: "and" }, isOwnerOFSMC(smartAccountAddress), { operator: "or" }, isParticipant(contract, surveyId, smartAccountAddress), { operator: "and" }, isOwnerOFSMC(smartAccountAddress)];
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
