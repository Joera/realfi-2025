import { IServices } from "../services/services";

export const authenticate = async (services:IServices, surveyId: string) => {

    const input = await services.waap.signMessage(`Sign in with your unlinkable account to co-own survey ${surveyId}`); 
    const key = await services.oprf.getSecp256k1(input);
    await services.safe.updateSignerWithKey(key);
    return await services.safe.connectToFreshSafe(surveyId);
}