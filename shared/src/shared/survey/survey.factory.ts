import { compactAction, EncryptedConfig, fetchLitApiKey, getDecryptForOwnerAction, getDecryptForRespondentAction } from '../index.js';


const extractCid = (result: unknown): string => {
  if (typeof result === 'string') {
    try { return JSON.parse(result).cid ?? result } catch { return result }
  }
  if (typeof result === 'object' && result !== null) {
    return (result as any).cid ?? (result as any).IpfsHash
  }
  return result as string
}

export const fetchSurvey = async (services: any, deployment: any, surveyId: string) => {

  return await services.viem.read(
      deployment.address as `0x{string}`, 
      deployment.abi,
      'getSurvey',
      [surveyId]
    );  
}

export const fetchAndDecryptSurveyWithOwner = async (services: any, deployment: any, surveyId: string, backendUrl: string) => {

    const [ipfsCid, poolId, createdAt] = await fetchSurvey(services, deployment, surveyId);

    const cid = extractCid(ipfsCid)
    const config: EncryptedConfig = JSON.parse(await services.ipfs.fetchFromPinata(cid));
    console.log("CONFIG", config)

    let d: any;

    let msg = await services.account.signMessage(`I authorize S3ntiment to access encrypted survey data for pool ${poolId}`)
    const litApiKey = await fetchLitApiKey(backendUrl, services.account.getSignerAddress(), msg, poolId || "")
    const decryptForOwnerAction = getDecryptForOwnerAction(poolId, deployment.address, services.account.getSignerAddress());

    try { 
        const data = await services.lit.decrypt(config.encryptedForOwner, litApiKey, decryptForOwnerAction);
        d = data.convertedData;
    } catch (e: any){
        console.log('Lit decrypt error:', e);
        console.log('Lit decrypt error message:', e?.message);
        console.log('Lit decrypt error details:', JSON.stringify(e?.details || e?.errorKind || e, null, 2));
    }

    return {
        id: surveyId,
        createdAt: Number(createdAt),
        ...d,
        ...config
    }
}


export const fetchAndDecryptSurveyWithRespondent = async (services: any, deployment: any, surveyId: string, backendUrl: string) => {

  

   // should get this from store 
    const [ ipfsCid, poolId, createdAt] = await services.viem.read(
      deployment.address as `0x{string}`, 
      deployment.abi,
      'getSurvey',
      [surveyId]
    );

    const cid = extractCid(ipfsCid);
    const config: EncryptedConfig = JSON.parse(await services.ipfs.fetchFromPinata(cid));

    // get the action 

    const signature = await services.account.signMessage('Request capability to decrypt');
    console.log("SIG",signature);
    const litApiKey = await fetchLitApiKey(backendUrl, services.account.getSignerAddress(), signature, poolId);
    const decryptForRespondentAction = compactAction(getDecryptForRespondentAction(poolId, deployment.address));

    console.log("RAW CONFIG", config)
    console.log("SIGNER", services.account.getSignerAddress())
    console.log("ACTION", decryptForRespondentAction)
    console.log("KEY", litApiKey)

    let d: any;

    try { 
   //   async decrypt(key: string, pkpId: string, ciphertext: string, userAddress: string, action: string): Promise<string> {
   // we should  include useraddress as a signature
   // how/where do we store pkpId? 
   // what account do we use? 
        const data = await services.lit.decrypt(litApiKey, config.pkpId, config.encryptedForRespondent, services.account.getSignerAddress(), decryptForRespondentAction);
        console.log("DATA", data);
        d = data.convertedData;
    } catch (e: any){
        console.log('Lit decrypt error:', e);
        console.log('Lit decrypt error message:', e?.message);
        console.log('Lit decrypt error details:', JSON.stringify(e?.details || e?.errorKind || e, null, 2));
    }

    return {
    id: surveyId,
    createdAt,
    ...d,
    ...config
    }
}

export const encryptAndStoreSurvey = async () => {

    // encryption part happens inside a promise.all 
}

