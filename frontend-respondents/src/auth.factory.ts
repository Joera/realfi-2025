import { base } from "viem/chains";
import { IServices } from "./services"
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' };
import { fetchSurvey } from "../../shared/src/shared";

export const authenticate = async (services: IServices, poolId: string) : Promise<boolean>=> {
         
    await services.waap.login(base);
    const input = await services.waap.signMessage(`Sign in with your unlinkable account for respondent pool ${poolId}`); // make into factory // set splash ? 
    const key = await services.oprf.getSecp256k1(input);
    await services.account.updateSignerWithKey(key);

    return await hasParticipatingAccount(services, poolId)
}

export const hasParticipatingAccount = async (services: IServices, poolId: string) : Promise<boolean> => {

    if(services.account.getSignerAddress() === '0x') return false;

    return await services.viem.read(
        surveyStore.address as `0x${string}`,
        surveyStore.abi,
        'isPoolMember',
        [poolId, services.account.getSignerAddress()]
    );

}