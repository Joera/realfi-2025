import { encodePacked, keccak256, recoverMessageAddress, toHex } from "viem";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' };
import { IServices } from './services.js';
import { CardData } from "@s3ntiment/shared";

// console.log('surveyStore import:', surveyStore);
console.log('contract address:', surveyStore.address);


export const parseCardURL = async (): Promise<CardData | null> => {

    try {
        const params = new URL(window.location.href).searchParams;

        const nullifier  = params.get('n');
        const batchId    = params.get('b');

        const signature  = params.get('sig');
        const surveyId   = params.get('s');

        if (!nullifier || !batchId || !signature || !surveyId) {
            console.error('Missing required card parameters');
            return null;
        }

        const decodedNullifier  = decodeURIComponent(nullifier);
        const decodedBatchId    = decodeURIComponent(batchId) as `0x${string}`;
        const decodedSignature  = decodeURIComponent(signature) as `0x${string}`;
        const decodedSurveyId   = decodeURIComponent(surveyId);

        const nullifierHex = toHex(decodedNullifier) as `0x${string}`;
        const pipeHex = toHex("|") as `0x${string}`;
        const addressHex = decodedBatchId;

        const packedMessage = (nullifierHex + pipeHex.slice(2) + addressHex.slice(2)) as `0x${string}`;
        const messageHash = keccak256(packedMessage);

        const surveyOwner = await recoverMessageAddress({
            message: { raw: messageHash },
            signature: decodedSignature,
        });

        return {
            nullifier:   decodedNullifier,
            batchId:     decodedBatchId,
            signature:   decodedSignature,
            surveyOwner,            
            surveyId:    decodedSurveyId,
        };

    } catch (error) {
        console.error('Error parsing card URL:', error);
        return null;
    }
};

export class Card {

    public data: CardData;

    constructor(data: CardData) {
        this.data = data;
    }

    async isUsed(services: IServices): Promise<boolean> {
        return await services.viem.read(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            "isNullifierUsed",
            [this.data.nullifier, this.data.batchId]
        );
    }

    async validate(services: IServices) {
        return await services.account.write(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            'validateCard',
            [this.data.surveyId, this.data.nullifier, this.data.batchId, this.data.signature],
            { waitForReceipt: true, confirmations: 2 }
        );
    }

    get surveyId() { return this.data.surveyId; }
    get nullifier() { return this.data.nullifier; }
    get batchId()   { return this.data.batchId; }
}