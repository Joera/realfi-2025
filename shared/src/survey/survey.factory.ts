import { base } from 'viem/chains';
import { accsForOwnerOrUser } from '../lit/';


export const fetchAndDecryptSurvey = async (services: any, deployment: any, surveyId: string, capabilityDelegation: any) => {

    const surveyInfo = await services.viem.read(
      deployment.address as `0x{string}`, 
      deployment.abi,
      'getSurvey',
      [surveyId]
    );
    
    const config = JSON.parse(await services.ipfs.fetchFromPinata(surveyInfo[0]));

    const accs = accsForOwnerOrUser(surveyId, deployment.address);
    
    console.log("b4 decryptin", services.lit.litClient.networkName)

    const authContext = await services.lit.createAuthContext(services.waap.walletClient, capabilityDelegation)

    let d: any;

    try { 
        const data = await services.lit.decrypt(config.surveyConfig, authContext, accs);
        d = data.convertedData;
    } catch (error){
        console.log(error);
    }

    return {
    id: surveyId,
    createdAt: surveyInfo[2],
    ...d
    }



}