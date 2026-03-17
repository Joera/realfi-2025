const isPoolSafe = (poolId: string, contract: string, safeAddress: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isPoolSafe",
  functionParams: [safeAddress, poolId],
  functionAbi: {
    type: "function",
    name: "isPoolSafe",
    stateMutability: "view",
    inputs: [
      { name: "addr", type: "address" },
      { name: "poolId", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});

const isPoolMember = (contract: string, poolId: string) => ({
  conditionType: "evmContract" as const,
  contractAddress: contract,
  chain: "base" as const,
  functionName: "isPoolMember",
  functionParams: [poolId, ":userAddress"],
  functionAbi: {
    type: "function",
    name: "isPoolMember",
    stateMutability: "view",
    inputs: [
      { name: "poolId", type: "string" },
      { name: "member", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  returnValueTest: {
    key: "",
    comparator: "=" as const,
    value: "true",
  },
});

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
  },
});

// Pool owner: Safe owns the pool AND :userAddress is a Safe signer
export const accsForPoolOwner = (poolId: string, contract: string, safeAddress: string) => {
  console.log(poolId, contract, safeAddress)
  return [isPoolSafe(poolId, contract, safeAddress), { operator: "and" }, isOwnerOfSafe(safeAddress)];
};

// Pool member: :userAddress (pool wallet EOA) is registered in the pool
export const accsForPoolMember = (contract: string, poolId: string) => {
  return [isPoolMember(contract, poolId)];
};

export const alwaysTrue = [
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
  },
];