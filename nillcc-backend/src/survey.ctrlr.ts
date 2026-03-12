import { recoverMessageAddress, Signature } from "viem";
import { accsForSurveyOwner, createSurveyCollectionSchema, EncryptedConfig } from "@s3ntiment/shared/";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { accsForRespondent } from "@s3ntiment/shared";

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

        const { surveyId, surveyConfig, safeAddress } = body;

        console.log("surveyId", surveyId)
        
        // we're going to replace this with a PKP ... and use lit actions to assign delegations

        // owned collections dont seem to work yet. 
        // const rawSchema = createOwnedSurveyCollectionSchema(surveyConfig);
        // const rawSchema = createStandardSurveyCollectionSchema(surveyConfig);

        const rawSchema = createSurveyCollectionSchema(surveyConfig, "standard");

        console.log(JSON.stringify(rawSchema))

        const collectionId = await this.nildb.createSurveyCollection(surveyId, rawSchema, this.nildb.builderDid.didString);
        console.log("collection id", collectionId)

        const contract = surveyStore.address;

        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([ // encryptedKey
            this.lit.encrypt(surveyConfig, accsForSurveyOwner(surveyConfig.id, contract, safeAddress)),
            this.lit.encrypt(surveyConfig, accsForRespondent(contract, surveyConfig.id))
        ]);

        const config: EncryptedConfig = {
            surveyId: collectionId,
            nilDid: this.nildb.builderDid.didString, // surveyOwnerDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            config: surveyConfig.config
        };

        console.log('📦 Survey config:', config);

        return await this.ipfs.uploadToPinata(JSON.stringify(config));
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