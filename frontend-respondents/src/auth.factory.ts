import { base } from "viem/chains";
import { IServices } from "./services"
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' };

export const authenticate = async (services: IServices, surveyId: string) : Promise<boolean>=> {

    await services.waap.login(base);
    const input = await services.waap.signMessage(`Sign in with your unlinkable account for survey ${surveyId}`); // make into factory // set splash ? 
    const key = await services.oprf.getSecp256k1(input);
    await services.account.updateSignerWithKey(key);

    return await hasParticipatingAccount(services, surveyId)
}

export const hasParticipatingAccount = async (services: IServices, surveyId: string) : Promise<boolean> => {

    if(services.account.getSignerAddress() == undefined) return false;

    return await services.viem.read(
        surveyStore.address as `0x${string}`,
        surveyStore.abi,
        'isRespondent',
        [surveyId, services.account.getSignerAddress()]
    );

}