import { accsForSurveyOwner, EncryptedConfig } from '../index.js';
import { accsForRespondent } from '../lit/accs.js';

export const fetchAndDecryptSurveyWithOwner = async (services: any, deployment: any, surveyId: string, authContext: any, safeAddress: string) => {

    const surveyInfo = await services.viem.read(
      deployment.address as `0x{string}`, 
      deployment.abi,
      'getSurvey',
      [surveyId]
    );
    
    const config: EncryptedConfig = JSON.parse(await services.ipfs.fetchFromPinata(surveyInfo[0]));

    const accs = accsForSurveyOwner(surveyId, deployment.address, safeAddress);

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
        createdAt: surveyInfo[2],
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
    
    const config: EncryptedConfig = JSON.parse(await services.ipfs.fetchFromPinata(surveyInfo[0]));

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
    createdAt: surveyInfo[2],
    ...d,
    ...config
    }
}

export const encryptAndStoreSurvey = async () => {

    // encryption part happens inside a promise.all 
}

