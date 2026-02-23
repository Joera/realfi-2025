import { getAddress, http, keccak256, toBytes } from "viem";
import { accsForOwnerOrUser } from "@s3ntiment/shared/lit";
import { Batch } from "@s3ntiment/shared/survey";

import { isCid } from "../utils/regex";
import { createBatchWallet, createZipFile, generateCardSecrets } from "./invitation.factory";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }
import { toSafeSmartAccount } from "permissionless/accounts";



export const fetchSurvey = async (services: any, authContext: any, surveyId: string) => {

    const s = await services.viem.readSurveyContract('getSurvey', [surveyId]);

    let d: any = {}

    if (isCid(s[0])) {

        let c = JSON.parse(await services.ipfs.fetchFromPinata(s[0]));
        const accs = accsForOwnerOrUser(surveyId, surveyStore.address);

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

    const { batchId, batchAccount } = await createBatchWallet(services);
    batch.id = getAddress(batchId);
    batch.survey = surveyId;

    const cards = await generateCardSecrets(batchAccount, batch);

    if (batch.medium == 'zip-file') {

        await createZipFile(cards, surveyId)
    }

    await registerBatch(services, batch);

    return cards;
}


export const registerBatch = async (services: any, batch: Batch) => {

    const args = [
        batch.survey,
        batch.id,
    ]

    const options = {
        waitForReceipt: true
    }

    console.log(surveyStore.abi, args)

    const registerBatch = await services.account.write(surveyStore.address, surveyStore.abi,"registerBatch", args, options);

    console.log("batch", registerBatch,)
}

export const deploySafe = async (services: any, salt: string): Promise<string> => {
    
    const safeAddress = await services.safe.predictSafeAddress(salt);

    if (await services.safe.isDeployed(safeAddress)) {
        return safeAddress;
    }
    
    const tempAccount = await toSafeSmartAccount({
        client: services.safe.publicClient,
        owners: [services.safe.signer],
        version: "1.4.1",
        saltNonce: BigInt(keccak256(toBytes(salt))),
        entryPoint: { address: "0x0000000071727De22E5E9d8BAf0edAc6f37da032", version: "0.7" },
    });

    // Get factory info directly from the account — no network calls needed
    const { factory, factoryData } = await tempAccount.getFactoryArgs();

    if (!factory || !factoryData) {
        throw new Error("No factory data — Safe may already be deployed");
    }

    await services.account.writeRaw(factory, factoryData, true);

    return safeAddress;
}