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

    async create(body: any) {

        const contract = surveyStore.address;
        const { poolId, safeAddress } = body;
     
        if (poolId == undefined)  return "missing poolId";
        if (safeAddress == undefined) return 'missing safeAddress';

        const pkpId = await this.lit.createPkp();
        const { group_id: groupId } = await this.lit.createGroup(`s3ntiment-${poolId}`);
        await this.lit.addPkpToGroup(groupId, pkpId);

        const decryptForOwnerAction = compactAction(getDecryptForOwnerAction(poolId, contract, safeAddress));
        const decryptForRespondentAction = compactAction(getDecryptForRespondentAction(poolId, contract));

        const encryptCid = await this.lit.getActionCid(encryptAction);
        const decryptOwnerCid = await this.lit.getActionCid(decryptForOwnerAction);
        const decryptMemberCid = await this.lit.getActionCid(decryptForRespondentAction);

        await this.lit.registerAction(encryptCid, 'encrypt');
        await this.lit.registerAction(decryptOwnerCid, `decrypt-owner-${poolId}`);
        await this.lit.registerAction(decryptMemberCid, `decrypt-member-${poolId}`);

        await this.lit.addActionToGroup(groupId, encryptCid);
        await this.lit.addActionToGroup(groupId, decryptOwnerCid);
        await this.lit.addActionToGroup(groupId, decryptMemberCid);

        const { usage_api_key } = await this.lit.createUsageKey({ executeInGroups: [groupId] });

        // 
        this.litPoolKeys.set(poolId, usage_api_key);

        // After pool creation, verify setup
        console.log('Pool setup verification:');
        console.log('- poolId:', poolId);
        console.log('- pkpId:', pkpId);
        console.log('- groupId:', groupId);
        console.log('- usageKey:', usage_api_key);

        return {
            pkpId,
            groupId,
        }

    }

    async update(body: any) {

        // but with what authority ???

        // can only be safe 
        // so shouldnt there be an action that allows for use of pkp to add an action? 

        // potentially add actions? // rotate usage key? 
    }
}