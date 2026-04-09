import { encodePacked, keccak256, recoverMessageAddress, toHex } from "viem";

import { CardData } from "@s3ntiment/shared";


const encodeNullifierBatchCombo = (decodedNullifier: string, decodedBatchId: string) => {

    const encoder = new TextEncoder();
    const nullifierBytes = encoder.encode(decodedNullifier);
    const pipeBytes = encoder.encode("|");
    const addressBytes = decodedBatchId.slice(2);

    const hexStr = Array.from(nullifierBytes)
    .concat(Array.from(pipeBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('') + addressBytes;

    const packedMessage = ('0x' + hexStr) as `0x${string}`;
    return keccak256(packedMessage);
}


export const parseCardURL = async (href: string): Promise<CardData | null> => {

    try {
        const params = new URL(href).searchParams;

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

        const messageHash = encodeNullifierBatchCombo(decodedNullifier, decodedBatchId);

        console.log("encoded combo", messageHash)

        const surveyOwner = await recoverMessageAddress({
            message: { raw: messageHash },
            signature: decodedSignature,
        });

        console.log("SURVEY OWNER", surveyOwner)

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

    async isUsed(services: any, surveyStore: any): Promise<boolean> {

        return await services.viem.read(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            "isNullifierUsed",
            [this.data.nullifier, this.data.batchId]
        );
    }

    async register(services: any, surveyStore: any, poolId: string) { // should be called register

        return await services.account.write(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            'registerInPool',
            [poolId, this.data.nullifier, this.data.batchId, this.data.signature],
            { waitForReceipt: true, confirmations: 2 }
        );
        
        // await waitUntilRegistered(poolId, this.data.nullifier) // poll contract until it returns true

    }

    get surveyId() { return this.data.surveyId; }
    get nullifier() { return this.data.nullifier; }
    get batchId()   { return this.data.batchId; }
}