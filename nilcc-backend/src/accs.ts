const surveyOwner = (surveyId: string) => ({
  conditionType: "evmContract" as const,
  chain: "base" as const,
  contractAddress: process.env.SURVEY_STORE_ADDRESS as string,
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

const user = () => ({
  conditionType: "evmContract" as const,
  chain: "base" as const,
  contractAddress: process.env.SURVEY_STORE_ADDRESS as string,
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

export const accsForSurveyOwner = (surveyId: string) => {
  return [surveyOwner(surveyId)];
};

export const accsForUser = () => {
  return [user()];
};

export const accsForOwnerOrUser = (surveyId: string) => {
  console.log("surveyId used for acc", surveyId);
  return [surveyOwner(surveyId), { operator: "or" }, user()];
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
