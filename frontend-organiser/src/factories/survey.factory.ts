import { accsForOwnerOrUser } from "../accs";
import { isCid } from "../utils/regex";

export const fetchSurvey = async (services: any, authContext: any, surveyId: string) => {


    const s = await services.viem.readSurveyContract('getSurvey', [surveyId]);

    let d: any = {}

    if (isCid(s[0]) && surveyId == "dc1d4342-1c7d-4e69-8bb3-b133209f4c95") {

        let c = JSON.parse(await services.ipfs.fetchFromPinata(s[0]));
        const accs = accsForOwnerOrUser(surveyId, import.meta.env.VITE_SURVEYSTORE_CONTRACT);

        try { 
            const data = await services.lit.decrypt(c.surveyConfig, authContext, accs);
            d = data.convertedData;
        } catch (error){
            console.log(error);
        }

        return {
        id: surveyId,
        createdAt: s[2],
        ...d
        }
    }
}