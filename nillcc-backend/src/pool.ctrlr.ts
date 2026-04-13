import { compactAction, encryptAction, getDecryptForOwnerAction, getDecryptForRespondentAction  } from "@s3ntiment/shared";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }

export class PoolController {

    private lit: any;
    private litPoolKeys: any;


    constructor(lit: any, litPoolKeys: any) {
        this.lit = lit; 
        this.litPoolKeys = litPoolKeys;
    }

    // separate pool and survey ??? 

    ethAddressToDid(address: string): string {
            return `did:pkh:eip155:1:${address.toLowerCase()}`;
        }

    async create(body: any) {
        const contract = surveyStore.address;
        const { poolId, safeAddress } = body;
    
        if (poolId == undefined) return "missing poolId";
        if (safeAddress == undefined) return 'missing safeAddress';

        // Step 1: Create PKP and group in parallel
        const [pkpId, { group_id: groupId }] = await Promise.all([
            this.lit.createPkp(),
            this.lit.createGroup(`s3ntiment-${poolId}`)
        ]);

        // Step 2: Add PKP to group + get action CIDs in parallel
        const decryptForOwnerAction = compactAction(getDecryptForOwnerAction(poolId, contract, safeAddress));
        const decryptForRespondentAction = compactAction(getDecryptForRespondentAction(poolId, contract));

        const [, encryptCid, decryptOwnerCid, decryptMemberCid] = await Promise.all([
            this.lit.addPkpToGroup(groupId, pkpId),
            this.lit.getActionCid(encryptAction),
            this.lit.getActionCid(decryptForOwnerAction),
            this.lit.getActionCid(decryptForRespondentAction)
        ]);

        // Step 3: Register all actions in parallel
        await Promise.all([
            this.lit.registerAction(encryptCid, 'encrypt'),
            this.lit.registerAction(decryptOwnerCid, `decrypt-owner-${poolId}`),
            this.lit.registerAction(decryptMemberCid, `decrypt-member-${poolId}`)
        ]);

        // Step 4: Add all actions to group in parallel
        await Promise.all([
            this.lit.addActionToGroup(groupId, encryptCid),
            this.lit.addActionToGroup(groupId, decryptOwnerCid),
            this.lit.addActionToGroup(groupId, decryptMemberCid)
        ]);

        const { usage_api_key } = await this.lit.createUsageKey({ executeInGroups: [groupId] });

        this.litPoolKeys.set(poolId, usage_api_key);

        console.log('Pool setup verification:');
        console.log('- poolId:', poolId);
        console.log('- pkpId:', pkpId);
        console.log('- groupId:', groupId);
        console.log('- usageKey:', usage_api_key);

     
        const pkpDid = this.ethAddressToDid(pkpId);

        return { pkpId, pkpDid, groupId };
    }

    async update(body: any) {

        // but with what authority ???

        // can only be safe 
        // so shouldnt there be an action that allows for use of pkp to add an action? 

        // potentially add actions? // rotate usage key? 
    }
}