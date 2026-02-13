import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL) 
});

const SURVEY_STORE_ADDRESS = '0x4CAfD69E3D7a9c37beCbFaF3D3D5C542F7b5fF6c'; // jouw contract address

const surveyStoreAbi = [{"inputs":[],"name":"InvalidSignature","type":"error"},{"inputs":[],"name":"NullifierAlreadyUsed","type":"error"},{"inputs":[],"name":"SignerNotSurveyOwner","type":"error"},{"inputs":[],"name":"SurveyAlreadyExists","type":"error"},{"inputs":[],"name":"SurveyNotFound","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"surveyId","type":"string"},{"indexed":true,"internalType":"string","name":"batchId","type":"string"},{"indexed":false,"internalType":"string","name":"nullifier","type":"string"},{"indexed":false,"internalType":"uint256","name":"newCount","type":"uint256"}],"name":"CardValidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"signer","type":"address"},{"indexed":false,"internalType":"bytes32","name":"messageHash","type":"bytes32"}],"name":"SignatureValidated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"surveyId","type":"string"},{"indexed":false,"internalType":"string","name":"ipfsCid","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"SurveyCreated","type":"event"},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"}],"name":"batchCardCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"surveyId","type":"string"},{"internalType":"string","name":"ipfsCid","type":"string"}],"name":"createSurvey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"surveyId","type":"string"},{"internalType":"string","name":"batchId","type":"string"}],"name":"getBatchCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"getOwnerSurveyCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"getOwnerSurveys","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"surveyId","type":"string"}],"name":"getSurvey","outputs":[{"internalType":"string","name":"ipfsCid","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"createdAt","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"nullifier","type":"string"},{"internalType":"string","name":"batchId","type":"string"}],"name":"isNullifierUsed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"authSigAddress","type":"address"},{"internalType":"string","name":"surveyId","type":"string"}],"name":"isOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"surveyId","type":"string"}],"name":"surveyExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"usedNullifiers","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"nullifier","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"},{"internalType":"string","name":"batchId","type":"string"},{"internalType":"string","name":"surveyId","type":"string"}],"name":"validateCard","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
export async function getSurvey(owner: `0x${string}`, surveyId: string) {

    const result = await client.readContract({
    address: SURVEY_STORE_ADDRESS as `0x${string}`,
    abi: surveyStoreAbi,
    functionName: 'getSurvey',
    args: [surveyId]
  }) as [string, `0x${string}`, bigint]; 

  const [ipfsCid, surveyOwner, createdAt] = result;

  let config = JSON.parse(await fromPinata(ipfsCid))

  return {
    ipfsCid,
    // didNil,
    // encryptedNilKey,
    surveyOwner,
    createdAt
  };
}
