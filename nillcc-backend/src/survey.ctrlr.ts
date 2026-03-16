import { recoverMessageAddress, Signature } from "viem";
import { accsForSurveyOwner, createSurveyCollectionSchema, EncryptedConfig, Survey } from "@s3ntiment/shared";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { accsForRespondent } from "@s3ntiment/shared";
import { stripScoring } from "./scoring.factory.js";

export class SurveyController {
    private nildb: any;
    private lit: any;
    private ipfs: any;
    private viem: any;

    constructor(nildb: any, lit: any, ipfs: any, viem: any) {
        this.nildb = nildb;
        this.lit = lit; 
        this.ipfs = ipfs;
        this.viem = viem;
    }

    async create(body: any) {

        const contract = surveyStore.address;
        const { surveyId, surveyConfig, safeAddress } = body;
        const { safeConfigWithScoring, safeConfig } = stripScoring(surveyConfig)

        const rawSchema = createSurveyCollectionSchema(safeConfig, "standard")
        const collectionId = await this.nildb.createSurveyCollection(surveyId, rawSchema, this.nildb.builderDid.didString)

        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([
            this.lit.encrypt(safeConfigWithScoring, accsForSurveyOwner(surveyId, contract, safeAddress)),
            this.lit.encrypt(safeConfig, accsForRespondent(contract, surveyId))
        ])

        const config: EncryptedConfig = {
            surveyId: collectionId,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            config: surveyConfig.config
        }

        return await this.ipfs.uploadToPinata(JSON.stringify(config))
    }

    async update(body: any) {

        const contract = surveyStore.address;
        const { surveyId, surveyConfig, safeAddress } = body;
        const { safeConfigWithScoring, safeConfig } = stripScoring(surveyConfig)

        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([
            this.lit.encrypt(safeConfigWithScoring, accsForSurveyOwner(surveyId, contract, safeAddress)),
            this.lit.encrypt(safeConfig, accsForRespondent(contract, surveyId))
        ])

        const config: EncryptedConfig = {
            surveyId,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            config: surveyConfig.config
        }

        console.log("B4", config)

        return await this.ipfs.uploadToPinata(JSON.stringify(config))

    }

    async get(surveyId: string) {
        const res = await this.viem.read(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            'getSurvey',
            [surveyId]
        );

        const cid = res[0];
        if (!cid) return null;

        console.log("FETCHED CID", cid)

        const raw = await this.ipfs.fetchFromPinata(cid);
        const config = JSON.parse(raw);
        // strip answer key before returning
        const { encryptedScoring, ...safe } = config;
        return safe;
    }

    // TODO: replace with nilCC blind scoring
    async score(surveyId: string, signer: string) {

        const contract = surveyStore.address;

        const res = await this.viem.read(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            'getSurvey',
            [surveyId]
        );

        const cid = res[0];
        const raw = await this.ipfs.fetchFromPinata(cid);
        const config = JSON.parse(raw);

        if (!config.encryptedForOwner) {
            return null;
        }

        // moeten we dit wel hier doen? zit idd alleen in surveyowner .. is dat geen denkfout? antwoorden moeten deelbaar zijn met user .. evt alleen na inzending
        // voorlopige oplossing: goede antwoorden - gewoon meesturen met de score 
        const survey: Survey = await this.lit.decrypt(config.encryptedForOwner, accsForSurveyOwner(surveyId, contract, config.config?.safe));

        const scoring: any = {}; 
        survey.groups?.map((group: any) => {
            const { scoring: groupScoring, ...safeGroup } = group
            if (groupScoring) {
                scoring[group.id] = groupScoring
            }
            return safeGroup
        })

        const answers = await this.nildb.getResponseForUser(surveyId, signer);

        let total = 0;
        let max = 0;

        for (const [_groupId, groupScoring] of Object.entries(scoring) as any) {
            for (const [questionId, s] of Object.entries(groupScoring) as any) {
                max += s.points;
                const answer = answers.find((a: any) => a.questionId === questionId);
                if (answer && answer.optionIndex === s.correctAnswer) {
                    total += s.points;
                }
            }
        }

        return { total, max, scoring };
    }

    async requestDelegation(body: any) {

        const { 
            did,
            signature,
            surveyId
        } = body;

    }

    async verifyOwnership(
        surveyOwnerAddress: string,
        requestorDid: string,
        message: string,
        signature: Signature
    ): Promise<boolean> {
        // Verify signature matches survey owner
        const recoveredAddress = await recoverMessageAddress({ message, signature });
        
        if (recoveredAddress.toLowerCase() !== surveyOwnerAddress.toLowerCase()) {
            return false;
        }

        // Verify the DID in message matches requestor
        const expectedMessage = `Request delegation for ${requestorDid}`;
        return message === expectedMessage;
    }

    // Helper: Verify Safe signer
    // async verifySafeSigner(
    //     safeAddress: string,
    //     surveyOwnerAddress: string,
    //     requestorDid: string,
    //     message: string,
    //     signature:  Signature
    // ): Promise<boolean> {
    //     // Verify Safe address matches survey owner
    //     if (safeAddress.toLowerCase() !== surveyOwnerAddress.toLowerCase()) {
    //         return false;
    //     }

    //     // Recover signer from signature
    //     // const signerAddress = await recoverMessageAddress({ message, signature });
        
    //     // // Check if signer is owner of the Safe
    //     // const safe = await Safe.init({
    //     //     provider: ethProvider,
    //     //     safeAddress: safeAddress,
    //     // });

    //     const owners = await safe.getOwners();
    //     const isSigner = owners.some(
    //         (owner: any) => owner.toLowerCase() === signerAddress.toLowerCase()
    //     );

    //     // Verify message format
    //     const expectedMessage = `Request delegation for ${requestorDid}`;
        
    //     return isSigner && message === expectedMessage;
    // }

    


}