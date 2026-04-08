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

    const userAddress = services.safe.getSignerAddress();
    const safeAddress = services.safe.getAddress();

    // console.log("SERVICES", services.safe)
    const signature = await services.safe.signMessage('Request capability to decrypt');
    const litApiKey = await fetchLitApiKey(backendUrl, userAddress, signature, poolId);
    const decryptForOwnerAction = compactAction(getDecryptForOwnerAction(poolId, deployment.address, safeAddress));
    let _cid = await services.lit.getActionCid(decryptForOwnerAction)

    console.log("ACTION", decryptForOwnerAction, _cid)

    try { 
        const data = await services.lit.decrypt(litApiKey, config.pkpId, config.encryptedForOwner, userAddress, signature, decryptForOwnerAction);
         d = JSON?.parse(data);
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

    const signature = await services.account.signMessage('Request capability to decrypt');
    const litApiKey = await fetchLitApiKey(backendUrl, services.account.getSignerAddress(), signature, poolId);
    const decryptForRespondentAction = compactAction(getDecryptForRespondentAction(poolId, deployment.address));

    // console.log("RAW CONFIG", config)
    // console.log("SIGNER", services.account.getSignerAddress())
    // console.log("ACTION", decryptForRespondentAction)
    // const _cid = await services.lit.getActionCid(decryptForRespondentAction)
    // console.log("ACTION CID", _cid)
    // console.log("KEY", litApiKey)

    try {
      const test = await fetch("https://api.dev.litprotocol.com/core/v1/get_node_chain_config");
      console.log("Lit API reachable:", test.ok);
    } catch (e) {
      console.log("Lit API unreachable:", e.message);
    }


    let d: any;

    try { 



        const data = await services.lit.decrypt(litApiKey, config.pkpId, config.encryptedForRespondent, services.account.getSignerAddress(), signature, decryptForRespondentAction);
        // console.log("DATA", data);
        d = JSON?.parse(data);
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

