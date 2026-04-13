import { recoverMessageAddress, Signature } from "viem";
import { compactAction, createSurveyCollectionSchema,  encryptAction, EncryptedConfig, getDecryptForOwnerAction, getDecryptForRespondentAction, getSimpleDecrypt, isScored, Survey } from "@s3ntiment/shared";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { calculateScore, stripScoring } from "@s3ntiment/shared";

export class SurveyController {
    private nildb: any;
    private lit: any;
    private litPoolKeys: any;
    private ipfs: any;
    private viem: any;

    constructor(nildb: any, lit: any, litPoolKeys: any, ipfs: any, viem: any) {
        this.nildb = nildb;
        this.lit = lit;
        this.litPoolKeys = litPoolKeys;
        this.ipfs = ipfs;
        this.viem = viem;
    }

    // separate pool and survey ??? 

    async create(body: any) {

        // also authorization issue 
        const { signature, surveyConfig } = body;

        // check if signature belongs to  poolOwner 
        const signer = await this.verifyPoolOwner(signature, surveyConfig.pool, surveyStore.address, surveyConfig.config.safe);
        if (!signer) throw new Error('Unauthorized');

        const usage_api_key = this.litPoolKeys.get(surveyConfig.pool)

        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig)
        const _isScored = isScored(surveyConfig);
        const rawSchema = createSurveyCollectionSchema(safeConfig, "standard")
        const collectionId = await this.nildb.createSurveyCollection(surveyConfig.id, rawSchema, this.nildb.builderDid.didString);

        // put this inside lit action
        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([
            this.lit.encrypt(usage_api_key, surveyConfig.config.pkpId, JSON.stringify(safeConfigWithScoring)),
            this.lit.encrypt(usage_api_key, surveyConfig.config.pkpId, JSON.stringify(safeConfig))
        ])

        const encryptedScoring = this.nildb.encryptToBuilder({scoring: scoring, groups: surveyConfig.groups});

        const config: EncryptedConfig = {
            surveyId: collectionId,
            poolId: surveyConfig.pool,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            encryptedScoring,
            config: surveyConfig.config,
            isScored: _isScored
        }

        return await this.ipfs.uploadToPinata(JSON.stringify(config))
    }

    async update(body: any) {

        const { signature, surveyConfig } = body;

        const signer = await this.verifyPoolOwner(signature, surveyConfig.pool, surveyStore.address, surveyConfig.config.safe);
        if (!signer) throw new Error('Unauthorized');

        const usage_api_key = this.litPoolKeys.get(surveyConfig.pool)

        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig);
        const _isScored = isScored(surveyConfig.groups);

        const [ encryptedForOwner, encryptedForRespondent] = await Promise.all([
            this.lit.encrypt(usage_api_key, surveyConfig.config.pkpId, JSON.stringify(safeConfigWithScoring)),
            this.lit.encrypt(usage_api_key, surveyConfig.config.pkpId, JSON.stringify(safeConfig))
        ])

        const encryptedScoring = this.nildb.encryptToBuilder({scoring: scoring, groups: surveyConfig.groups});

        const config: EncryptedConfig = {
            surveyId: surveyConfig.id,
            poolId: surveyConfig.pool,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            encryptedScoring,
            config: surveyConfig.config,
            isScored: _isScored
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

    async verifyPoolOwner(signature: string, poolId: string, contract: string, safeAddress: string): Promise<string | null> {
    
        const signerAddress = await this.viem.verifyMessage('Request capability to create survey', signature);
        
        const isPoolSafe = await this.viem.read(contract, 
            ['function isPoolSafe(address addr, string poolId) view returns (bool)'],
            'isPoolSafe', 
            [safeAddress, poolId]
        );
        
        if (!isPoolSafe) return null;

        const isOwner = await this.viem.read(safeAddress,
            ['function isOwner(address owner) view returns (bool)'],
            'isOwner',
            [signerAddress]
        );

        if (!isOwner) return null;

        return signerAddress;
    }

    // async verifyOwnership(
    //     surveyOwnerAddress: string,
    //     requestorDid: string,
    //     message: string,
    //     signature: Signature
    // ): Promise<boolean> {
    //     // Verify signature matches survey owner
    //     const recoveredAddress = await recoverMessageAddress({ message, signature });
        
    //     if (recoveredAddress.toLowerCase() !== surveyOwnerAddress.toLowerCase()) {
    //         return false;
    //     }

    //     // Verify the DID in message matches requestor
    //     const expectedMessage = `Request delegation for ${requestorDid}`;
    //     return message === expectedMessage;
    // }
}