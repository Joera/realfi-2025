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

    async create(body: any) {

        const contract = surveyStore.address;
        const { surveyId, poolId, surveyConfig, safeAddress } = body;
        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig)
        const _isScored = isScored(surveyConfig.groups);

        const rawSchema = createSurveyCollectionSchema(safeConfig, "standard")
        const collectionId = await this.nildb.createSurveyCollection(surveyId, rawSchema, this.nildb.builderDid.didString);

        // HACK: reuse existing Lit setup for MTE pool (5f6b3f9b-...)
        // TODO: proper existing-pool handling lives in the newer version
        let pkpId: string;
        let groupId: number;
        let usage_api_key: string;

        if (poolId === '5f6b3f9b-5676-4927-b11a-0b1f02344cdf') {
            pkpId = '0x7598155069ba02e7dd87afc0c2b5e587b34b2379';
            groupId = 22;
            usage_api_key = await this.litPoolKeys.get(poolId);
            if (!usage_api_key) {
                throw new Error('No stored usage key for MTE pool — need to recover or re-seed');
            }
            console.log('Reusing existing Lit setup for MTE pool', { pkpId, groupId });
        } else {
            pkpId = await this.lit.createPkp();
            const { group_id } = await this.lit.createGroup(`s3ntiment-${poolId}`);
            groupId = group_id;
            await this.lit.addPkpToGroup(groupId, pkpId);

            const decryptForOwnerAction = compactAction(getDecryptForOwnerAction(poolId, contract, safeAddress));
            const decryptForRespondentAction = compactAction(getDecryptForRespondentAction(poolId, contract));

            console.log(decryptForOwnerAction)

            const encryptCid = await this.lit.getActionCid(encryptAction);
            const decryptOwnerCid = await this.lit.getActionCid(decryptForOwnerAction);
            const decryptMemberCid = await this.lit.getActionCid(decryptForRespondentAction);

            await this.lit.registerAction(encryptCid, 'encrypt');
            await this.lit.registerAction(decryptOwnerCid, `decrypt-owner-${poolId}`);
            await this.lit.registerAction(decryptMemberCid, `decrypt-member-${poolId}`);

            await this.lit.addActionToGroup(groupId, encryptCid);
            await this.lit.addActionToGroup(groupId, decryptOwnerCid);
            await this.lit.addActionToGroup(groupId, decryptMemberCid);

            ({ usage_api_key } = await this.lit.createUsageKey({ executeInGroups: [groupId] }));
            this.litPoolKeys.set(poolId, usage_api_key);
        }

        const [ encryptedForOwner, encryptedForRespondent ] = await Promise.all([
            this.lit.encrypt(usage_api_key, pkpId, JSON.stringify(safeConfigWithScoring)),
            this.lit.encrypt(usage_api_key, pkpId, JSON.stringify(safeConfig))
        ]);

        console.log('Pool setup verification:');
        console.log('- poolId:', poolId);
        console.log('- pkpId:', pkpId);
        console.log('- groupId:', groupId);
        console.log('- usageKey:', usage_api_key);

        const encryptedScoring = this.nildb.encryptToBuilder({ scoring, groups: surveyConfig.groups });

        const config: EncryptedConfig = {
            surveyId: collectionId,
            poolId,
            nilDid: this.nildb.builderDid.didString,
            pkpId,
            groupId: groupId,
            encryptedForOwner,
            encryptedForRespondent,
            encryptedScoring,
            config: surveyConfig.config,
            isScored: _isScored
        };

        const cid = await this.ipfs.uploadToPinata(JSON.stringify(config));

        return {
            cid,
            pkpId,
            groupId
        }
    }

    async update(body: any) {

        console.log('update body received:', { 
            surveyId: body.surveyId, 
            poolId: body.poolId, 
            pkpId: body.pkpId, 
            groupId: body.groupId,
            hasConfig: !!body.surveyConfig,
            safeAddress: body.safeAddress
        });

        const contract = surveyStore.address;
        const { surveyId, poolId, pkpId, groupId, surveyConfig, safeAddress } = body;

        console.log(surveyConfig);

        const { safeConfigWithScoring, safeConfig, scoring } = stripScoring(surveyConfig);
        const _isScored = isScored(surveyConfig.groups);

        // Get the pool's stored usage key (same as create() does for existing pool branch)
        const usage_api_key = await this.litPoolKeys.get(poolId);
        if (!usage_api_key) {
            throw new Error(`No stored usage key for pool ${poolId}`);
        }

        const [ encryptedForOwner, encryptedForRespondent ] = await Promise.all([
            this.lit.encrypt(usage_api_key, pkpId, JSON.stringify(safeConfigWithScoring)),
            this.lit.encrypt(usage_api_key, pkpId, JSON.stringify(safeConfig))
        ]);

        const encryptedScoring = this.nildb.encryptToBuilder({ scoring, groups: surveyConfig.groups });

        const config: EncryptedConfig = {
            surveyId,
            poolId,
            nilDid: this.nildb.builderDid.didString,
            pkpId,
            groupId,
            encryptedForOwner,
            encryptedForRespondent,
            encryptedScoring,
            config: surveyConfig.config,
            isScored: _isScored
        };

        return await this.ipfs.uploadToPinata(JSON.stringify(config));
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