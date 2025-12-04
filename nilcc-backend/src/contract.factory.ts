import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL) 
});

const SURVEY_STORE_ADDRESS = '0x6Ab10D4705041408b2ED049F12cc0606B735dF0e'; // jouw contract address

const surveyStoreAbi = [
  {
    name: 'getSurvey',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'surveyName', type: 'string' }
    ],
    outputs: [
      { name: 'ipfsCid', type: 'string' },
      { name: 'didNil', type: 'string' },
      { name: 'encryptedNilKey', type: 'string' },
      { name: 'surveyOwner', type: 'address' },
      { name: 'createdAt', type: 'uint256' }
    ]
  }
] as const;

export async function getSurvey(owner: `0x${string}`, surveyName: string) {

  const [ipfsCid, didNil, encryptedNilKey, surveyOwner, createdAt] = await client.readContract({
    address: SURVEY_STORE_ADDRESS as `0x${string}`,
    abi: surveyStoreAbi,
    functionName: 'getSurvey',
    args: [owner, surveyName]
  });

  return {
    ipfsCid,
    didNil,
    encryptedNilKey,
    surveyOwner,
    createdAt
  };
}
