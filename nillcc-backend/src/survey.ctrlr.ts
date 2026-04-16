import { createSurveyCollectionSchema, EncryptedConfig, isScored, withRetry } from "@s3ntiment/shared";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { calculateScore, stripScoring } from "@s3ntiment/shared";
import { NillionPkpClient } from "./services/nildb.pkp.service.js";

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

    // Authorization is enforced on-chain: for new pools, the caller becomes the owner;
    // for existing pools, the contract reverts if msg.sender != pool.safe.
    async create(body: any) {

        const { surveyConfig } = body;

        const usage_api_key = await this.litPoolKeys.get(surveyConfig.pool)

        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig)
        const _isScored = isScored(surveyConfig.groups);
        const rawSchema = createSurveyCollectionSchema(safeConfig, "owned")

        const nillPkp = new NillionPkpClient(this.lit)
        await nillPkp.createCollection(surveyConfig.config.pkpId, surveyConfig.config.pkpDid, usage_api_key, rawSchema)

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

    // Authorization is enforced on-chain: for new pools, the caller becomes the owner;
    // for existing pools, the contract reverts if msg.sender != pool.safe.
    async update(body: any) {

        const { surveyConfig } = body;

        const usage_api_key = await this.litPoolKeys.get(surveyConfig.pool)

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

    async getUserDelegation(poolId: string, surveyId: string, userDid: string, pkpId: string, pkpDid: string) {

        console.log("POOLID",poolId)

        const usageKey = await this.litPoolKeys.get(poolId);

        console.log("KEY", usageKey)

        const nillPkp = new NillionPkpClient(this.lit)
        return await nillPkp.getUserWriteDelegation(surveyId, userDid, poolId, usageKey, pkpId, pkpDid);
        
    }

    // async verifyPoolOwner(signature: `0x${string}`, poolId: string, contract: `0x${string}`, safeAddress: `0x${string}`): Promise<string | null> {

    //     const signerAddress = await this.viem.verifyMessage('create a s3ntiment survey', signature);

    //     console.log("SIGNER", signerAddress)
    //     console.log("SAFE", safeAddress)
    //     console.log("POOLID", poolId)
        
    //     const isPoolSafe = await this.viem.read(
    //         contract, 
    //         parseAbi(['function isPoolSafe(address addr, string poolId) view returns (bool)']),
    //         'isPoolSafe', 
    //         [safeAddress, poolId]
    //     );

    //     console.log("ISPOOLSAFE", isPoolSafe)
        
    //     if (!isPoolSafe) return null;

    //     const isOwner = await this.viem.read(
    //         safeAddress,
    //         parseAbi(['function isOwner(address owner) view returns (bool)']),
    //         'isOwner',
    //         [signerAddress]
    //     );

    //     console.log("ISOWNER", isOwner)

    //     if (!isOwner) return null;

    //     return signerAddress;
    // }

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