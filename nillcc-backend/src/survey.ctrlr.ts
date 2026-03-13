import { recoverMessageAddress, Signature } from "viem";
import { accsForSurveyOwner, createSurveyCollectionSchema, EncryptedConfig } from "@s3ntiment/shared";
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

        // Split scoring out of groups before anything else
        const scoring: Record<string, any> = {}
        const safeGroups = surveyConfig.groups.map((group: any) => {
            const { scoring: groupScoring, ...safeGroup } = group
            if (groupScoring) {
                // key by groupId to keep it locatable later
                scoring[group.id] = groupScoring
            }
            return safeGroup
        })

        const safeConfig = { ...surveyConfig, groups: safeGroups }
        const hasScoring = Object.keys(scoring).length > 0

        const rawSchema = createSurveyCollectionSchema(safeConfig, "standard")
        const collectionId = await this.nildb.createSurveyCollection(surveyId, rawSchema, this.nildb.builderDid.didString)

        const contract = surveyStore.address;

        const [ encryptedForOwner, encryptedForRespondent, encryptedScoring] = await Promise.all([
            this.lit.encrypt(safeConfig, accsForSurveyOwner(safeConfig.id, contract, safeAddress)),
            this.lit.encrypt(safeConfig, accsForRespondent(contract, safeConfig.id)),
            hasScoring
                ? this.lit.encrypt(scoring, accsForSurveyOwner(safeConfig.id, contract, safeAddress))
                : Promise.resolve(null)
        ])

        const config: EncryptedConfig = {
            surveyId: collectionId,
            nilDid: this.nildb.builderDid.didString,
            encryptedForOwner,
            encryptedForRespondent,
            ...(encryptedScoring && { encryptedScoring }),
            config: surveyConfig.config
        }

        return await this.ipfs.uploadToPinata(JSON.stringify(config))
    }

    async get(surveyId: string) {
        const cid = await this.viem.read(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            'getSurveyCid',
            [surveyId]
        );
        if (!cid) return null;
        const raw = await this.ipfs.fetchFromPinata(cid);
        const config = JSON.parse(raw);
        // strip answer key before returning
        const { encryptedScoring, ...safe } = config;
        return safe;
    }

    // TODO: replace with nilCC blind scoring
    async score(surveyId: string, signer: string) {

        // 1. Get CID from chain
        const cid = await this.viem.read(
            surveyStore.address as `0x${string}`,
            surveyStore.abi,
            'getSurveyCid',
            [surveyId]
        );

        // 2. Fetch config from IPFS
        const raw = await this.ipfs.fetchFromPinata(cid);
        const config = JSON.parse(raw);

        // 3. Bail early if no scoring (not a quiz survey)
        if (!config.encryptedScoring) {
            return null;
        }

        // 4. Decrypt answer key (owner/builder Lit identity)
        // TODO: use PKP here instead of builder key
        const scoring = await this.lit.decrypt(config.encryptedScoring);

        // 5. Fetch respondent's answers from nilDB
        const answers = await this.nildb.getResponseForUser(surveyId, signer);

        // 6. Score locally
        // scoring: Record<groupId, Record<questionId, { correctAnswer: number, points: number }>>
        // answers: SurveyAnswer[]
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

        return { total, max, pct: Math.round((total / max) * 100) };
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