import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }


const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL) 
});


export async function getSurvey(owner: `0x${string}`, surveyId: string) {

    const result = await client.readContract({
    address: surveyStore.address as `0x${string}`,
    abi: surveyStore.abi,
    functionName: 'getSurvey',
    args: [surveyId]
  }) as [string, `0x${string}`, bigint]; 

  const [ipfsCid, surveyOwner, createdAt] = result;

 // let config = JSON.parse(await fromPinata(ipfsCid))

  return {
    ipfsCid,
    // didNil,
    // encryptedNilKey,
    surveyOwner,
    createdAt
  };
}
