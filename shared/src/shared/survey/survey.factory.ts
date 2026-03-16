import { accsForSurveyOwner, EncryptedConfig } from '../index.js';
import { accsForRespondent } from '../lit/accs.js';

const extractCid = (result: unknown): string => {
  if (typeof result === 'string') {
    try { return JSON.parse(result).cid ?? result } catch { return result }
  }
  if (typeof result === 'object' && result !== null) {
    return (result as any).cid ?? (result as any).IpfsHash
  }
  return result as string
}

export const fetchAndDecryptSurveyWithOwner = async (services: any, deployment: any, surveyId: string, authContext: any, safeAddress?: string) => {

    const surveyInfo = await services.viem.read(
      deployment.address as `0x{string}`, 
      deployment.abi,
      'getSurvey',
      [surveyId]
    );  

    console.log("FROM CONTRACT", surveyInfo)

    const cid = extractCid(surveyInfo[0])
    const config: EncryptedConfig = JSON.parse(await services.ipfs.fetchFromPinata(cid));
    console.log("CONFIG", config)
    const accs = accsForSurveyOwner(surveyId, deployment.address, config.config.safe || "0x");

    let d: any;

    try { 
        const data = await services.lit.decrypt(config.encryptedForOwner, authContext, accs);
        d = data.convertedData;
    } catch (e: any){
        console.log('Lit decrypt error:', e);
        console.log('Lit decrypt error message:', e?.message);
        console.log('Lit decrypt error details:', JSON.stringify(e?.details || e?.errorKind || e, null, 2));
    }

    return {
        id: surveyId,
        createdAt: Number(surveyInfo[2]),
        ...d,
        ...config
    }
}

export const fetchAndDecryptSurveyWithRespondent = async (services: any, deployment: any, surveyId: string, authContext: any) => {

    const surveyInfo = await services.viem.read(
      deployment.address as `0x{string}`, 
      deployment.abi,
      'getSurvey',
      [surveyId]
    );

    const cid = extractCid(surveyInfo[0]);
    const config: EncryptedConfig = JSON.parse(await services.ipfs.fetchFromPinata(cid));
    const accs = accsForRespondent(deployment.address, surveyId);

    let d: any;

    try { 
        const data = await services.lit.decrypt(config.encryptedForRespondent, authContext, accs);
        d = data.convertedData;
    } catch (e: any){
        console.log('Lit decrypt error:', e);
        console.log('Lit decrypt error message:', e?.message);
        console.log('Lit decrypt error details:', JSON.stringify(e?.details || e?.errorKind || e, null, 2));
    }

    return {
    id: surveyId,
    createdAt: Number(surveyInfo[2]),
    ...d,
    ...config
    }
}

export const encryptAndStoreSurvey = async () => {

    // encryption part happens inside a promise.all 
}

