import { recoverMessageAddress, Signature } from "viem";
import { accsForPoolMember, accsForPoolOwner, createSurveyCollectionSchema, EncryptedConfig, Survey } from "@s3ntiment/shared";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { calculateScore, stripScoring } from "@s3ntiment/shared";

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
        const { surveyId, poolId, surveyConfig, safeAddress } = body;
        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig)

        const rawSchema = createSurveyCollectionSchema(safeConfig, "standard")
        const collectionId = await this.nildb.createSurveyCollection(surveyId, rawSchema, this.nildb.builderDid.didString);

        const acc1 = accsForPoolOwner(poolId, contract, safeAddress);

        console.log("ACC",acc1);

        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([
            this.lit.encrypt(safeConfigWithScoring, acc1),
            this.lit.encrypt(safeConfig, accsForPoolMember(contract, poolId))
        ])

        const encryptedScoring = this.nildb.encryptToBuilder({scoring: scoring, groups: surveyConfig.groups});

        const config: EncryptedConfig = {
            surveyId: collectionId,
            poolId: poolId,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            encryptedScoring,
            config: surveyConfig.config
        }

        return await this.ipfs.uploadToPinata(JSON.stringify(config))
    }

    async update(body: any) {

        const contract = surveyStore.address;
        const { surveyId, poolId, surveyConfig, safeAddress } = body;

        console.log(surveyConfig)

        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig)

        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([
            this.lit.encrypt(safeConfigWithScoring, accsForPoolOwner(poolId, contract, safeAddress)),
            this.lit.encrypt(safeConfig, accsForPoolMember(contract, poolId))
        ])

        const encryptedScoring = this.nildb.encryptToBuilder({scoring: scoring, groups: surveyConfig.groups});

        const config: EncryptedConfig = {
            surveyId,
            poolId: poolId,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            encryptedScoring,
            config: surveyConfig.config
        }

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


    async score(surveyId: string, signerAddress: string) {

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


        // temp solution .. see dilemma in obsidian 
       const { scoring, groups } = this.nildb.decryptFromBuilder(config.encryptedScoring);

       const existingIds = await this.nildb.exists(surveyId, signerAddress)

       if (existingIds[0]) {

            const userData = await this.nildb.getResponseById(surveyId, existingIds[0]);

            console.log(scoring)
            console.log(userData)
            console.log(groups)

            const s = calculateScore(scoring, userData, groups);
            console.log(s)

            return s;

       } else {

        console.log("no entry found")
        return false;

       }

       
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