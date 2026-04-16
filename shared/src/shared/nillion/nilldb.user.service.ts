import {
  Signer,
  Did
} from '@nillion/nuc';
import {
  NucCmd,
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';
import { Survey, SurveyAnswer } from '../survey/types.js';
import { createUserDataObject } from '../survey/index.js';
import { Signature } from 'viem';
import { StringifyOptions } from 'node:querystring';

const randomUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class NillDBUserService {

    private nilDBNodes: string;
    signer!: Signer;
    userDidString!: string;
    user: any;
    builderDid: any;
 
    constructor(builderDid: any, nilDBNodes: string) { 
        this.builderDid = builderDid;
        this.nilDBNodes = nilDBNodes;
    }

    async init(seed: string) {
        this.signer = Signer.fromPrivateKey(seed);

        this.userDidString = (await this.signer.getDid()).didString;
        console.log('User DID:', this.userDidString);

        // SDK 3.0: no more nilauthClient needed
        this.user = await SecretVaultUserClient.from({
            baseUrls: this.nilDBNodes.split(','),
            signer: this.signer,
            blindfold: {
                operation: 'store',
            },
        });
    }

    async storeStandard(backendUrl: string, surveyId: string, poolId: string, userData: any, signature: Signature | `0x${string}`, signer: string) {
        return await fetch(`${backendUrl}/api/surveys/${surveyId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                surveyId,
                poolId,
                userData,
                signature,
                signer
            })
        });
    }

    async storeOwned(uuid: string, survey: Survey, answers: any, surveyId: string, delegationToken: string) {
   
        const userPrivateData = createUserDataObject(uuid, answers, survey, "");
        return await this.createData(survey, userPrivateData, delegationToken) 
    }

     async updateOwned(uuid: string, survey: Survey, answers: any, surveyId: string, delegationToken: string, documentId: string) {
        
        const userPrivateData = createUserDataObject(uuid, answers, survey, "");
        
        await this.user.deleteData({
            collection: surveyId,
            data: [userPrivateData],
            document: documentId
        });

        return await this.createData(survey, userPrivateData, delegationToken) 
    } 
        

    async createData(survey: Survey, userPrivateData: any, delegationToken: string) {

        console.log("DID", survey.config!.pkpDid)
        console.log("=== storeOwned debug ===");
        console.log("surveyId (collection):", survey.id);
        console.log("owner (userDid):", this.userDidString);
        console.log("grantee (pkpDid):", survey.config!.pkpDid);
        console.log("delegationToken present:", !!delegationToken);
        console.log("delegationToken:", delegationToken?.substring(0, 100) + "...");
        console.log("user client nodes:", this.user.nodes?.map((n: any) => n.id?.didString));

        try { 

            const uploadResults = await this.user.createData(
                {
                    owner: this.userDidString,
                    acl: {
                        grantee: survey.config!.pkpDid, 
                        read: true,
                        write: false,
                        execute: true,
                    },
                    collection: survey.id,
                    data: [userPrivateData],
                },
                { auth: { delegation: delegationToken } }
            );

            console.log('success', uploadResults);

            return { 
                ok: true,  
                response: uploadResults
            }

        } catch (e: any) {
            console.log('error', JSON.stringify(e, null, 2));
            console.log('error message', e?.message);
            console.log('error cause', e?.cause);
            if (Array.isArray(e)) {
                e.forEach((n, i) => console.log(`node ${i}`, JSON.stringify(n, null, 2)));
            }
            throw e;
        }
    }

 

    async getUserDelegationToken(signature: string, surveyId: string, backendUrl: string) {
        console.log('requesting delegation for DID:', this.userDidString);

        try {
            const response = await fetch(`${backendUrl}/api/surveys/${surveyId}/delegation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    didString: this.userDidString,
                    surveyId,
                    signature
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const dtoken: any = await response.json();
            console.log(typeof dtoken.delegation);
            return dtoken.delegation;
        
        } catch (error) {
            console.error("Failed to get delegation token:", error);
            throw error;
        }
    }

    async getUserSurveyAnswers(surveyId: string) {
        try {
            const dataRefs = await this.user.listDataReferences();

            const surveyDataRefs: any[] = dataRefs.data.filter((ref: any) => 
                ref.collection === surveyId
            );

            if (surveyDataRefs.length === 0) {
                console.log('No previous survey data found');
                return null;
            }

            console.log(surveyDataRefs[0]);

            const surveyData = await this.user.readData({
                collection: surveyId,
                document: surveyDataRefs[0].document
            });

            if (surveyData.data.surveyId === surveyId) {
                return surveyData.data;
            }

            return null;
        } catch (error) {
            console.error('Error fetching user survey answers:', error);
            return null;
        }
    }
}