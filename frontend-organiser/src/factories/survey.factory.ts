import { accsForOwnerOrUser } from "../accs";
import { Batch, Survey } from "../types";
import { isCid } from "../utils/regex";
import { createZipFile, generateCardSecrets } from "./invitation.factory";

export const fetchSurvey = async (services: any, authContext: any, surveyId: string) => {


    const s = await services.viem.readSurveyContract('getSurvey', [surveyId]);

    let d: any = {}

    if (isCid(s[0])) {

        let c = JSON.parse(await services.ipfs.fetchFromPinata(s[0]));
        const accs = accsForOwnerOrUser(surveyId, import.meta.env.VITE_SURVEYSTORE_CONTRACT);

        console.log("b4 decryptin", services.lit.litClient.networkName)

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

export const createBatch = async (services: any, batch: Batch, surveyId: string) => {


    console.log("creating batch")

    const cards: any[] = await generateCardSecrets(services, batch.id, batch.amount, surveyId);

    if (batch.medium == 'zip-file') {

        await createZipFile(cards, surveyId)
    }
}
