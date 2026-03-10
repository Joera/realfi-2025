import { IServices } from "../services/services";

export const authenticate = async (services:IServices) => {
    const input = await services.waap.signMessage(`Sign into your unlinkable account`); 
    const key = await services.oprf.getSecp256k1(input)
    await services.safe.updateSignerWithKey(key);
}