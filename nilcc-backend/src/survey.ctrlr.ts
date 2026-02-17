import { Builder, Codec, Signer } from "@nillion/nuc";
import { secp256k1 } from "@noble/curves/secp256k1.js";
import { bytesToHex, recoverMessageAddress, Signature, verifyMessage } from "viem";
import { accsForUser, accsForSurveyOwner, accsForOwnerOrUser, alwaysTrue } from "./accs";
import { createSurveyCollectionSchema } from "./create_collection";
import { SurveyConfig } from "./types";


export class SurveyController {
    private nildb: any;
    private lit: any;
    private pinata: any;
    private viem: any;

    constructor(nildb: any, lit: any, pinata: any, viem: any) {
        this.nildb = nildb;
        this.lit = lit; 
        this.pinata = pinata;
        this.viem = viem;
    }


    async create(body: any) {

        // signerAddress,
        // authContext

        const { surveyConfig } = body;

        console.log(0)
        
        // Generate survey-specific keypair
        const privateKeyBytes = secp256k1.utils.randomSecretKey();
        const privateKeyHex = bytesToHex(privateKeyBytes).slice(2);
        const surveyOwner = Signer.fromPrivateKey(privateKeyHex, 'key');
        const surveyOwnerDid = await surveyOwner.getDid();

        console.log(1, surveyOwnerDid.didString)

        // // Create collection
        const rawSchema = createSurveyCollectionSchema(surveyConfig);

        // NOT WORKING ON DESKTOP ??????????? 
        // const collectionId = await this.nildb.createSurveyCollection(rawSchema, surveyOwnerDid.didString);
        // console.log(collectionId)

        const contract = process.env.SURVEY_STORE_ADDRESS || "";

        // Encrypt everything
        const [encryptedSurveyConfig, encryptedKey] = await Promise.all([
            this.lit.encrypt("harry", accsForOwnerOrUser(surveyConfig.id, contract)),
            this.lit.encrypt(privateKeyHex, accsForSurveyOwner(surveyConfig.id, contract))
        ]);

        const config = {

            surveyId: surveyConfig.id,
            nilDid: surveyOwnerDid.didString,
            encryptedNilKey: encryptedKey,
            surveyConfig: encryptedSurveyConfig
        };

        console.log('📦 Survey config:', config);

        const res = await this.pinata.uploadJSON(config);

        return res.IpfsHash;
    }

    async requestDelegation(body: any) {

        const { 
            surveyId,
            requestorDid,
            signature,     
            message  
        } = body;


        const [ ipfsCid, owner, createdAt] = this.viem.readContract('getSurvey', surveyId)

        const surveyConfig: any = JSON.parse(this.pinata.get(ipfsCid));

        
        // Path A: Direct owner
        const isDirectOwner = await this.verifyOwnership(
            owner,
            requestorDid,
            message,
            signature
        );

        // Path B: Safe signer
        // let isSafeSigner = false;
        // if (safeAddress) {
        //     isSafeSigner = await this.verifySafeSigner(
        //         safeAddress,
        //         owner,
        //         requestorDid,
        //         message,
        //         signature
        //     );
        // }

        if (!isDirectOwner) { //  && !isSafeSigner
            return { 
                error: 'Not authorized: must be survey owner or Safe signer' 
            };
        }

        // 3. Create delegation (builder signs)
        const delegation = this.nildb.getDelegation(owner, surveyConfig.collectionID) 
        

        // 4. Return serialized delegation
        return {
            delegation: Codec.serializeBase64Url(delegation),
            expiresAt: Date.now() + (30 * 24 * 3600 * 1000)
        };

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