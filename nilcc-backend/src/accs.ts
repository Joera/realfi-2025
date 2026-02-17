const surveyOwner = (surveyId: string, contract: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isOwner",
  functionParams: [":userAddress", surveyId],
  functionAbi: {
    name: "isOwner",
    inputs: [
      { name: "authSigAddress", type: "address" },
      { name: "surveyId", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});

const user = (contract: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isNullifierUsed",
  functionParams: [":nullifier", ":batchId"],
  functionAbi: {
    name: "isNullifierUsed",
    inputs: [
      { name: "nullifier", type: "string" },
      { name: "batchId", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});

export const accsForSurveyOwner = (surveyId: string, contract: string) => {
  return [surveyOwner(surveyId, contract)];
};

export const accsForUser = (contract: string) => {
  return [user(contract)];
};

export const accsForOwnerOrUser = (surveyId: string, contract: string) => {
  console.log("surveyId used for acc", surveyId);
  return [surveyOwner(surveyId, contract), { operator: "or" }, user(contract)];
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