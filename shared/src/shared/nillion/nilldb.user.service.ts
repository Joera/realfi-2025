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
import { Signature, universalSignatureValidatorByteCode } from 'viem';



const randomUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};


export class NillDBUserService {

    private nilChainUrl: string;
    private nilAuthUrl: string;
    private nilDBNodes: string;
    builderKeypair: any
    signer!: Signer;
    userDidString!: string;
    user: any;
    payer: any;
    nilauth: any;
    builderDid: any;
 
    constructor (builderDid: any, nilChainUrl: string, nilAuthUrl: string, nilDBNodes: string) { 

        this.builderDid = builderDid;
        this.nilChainUrl = nilChainUrl;
        this.nilAuthUrl = nilAuthUrl;
        this.nilDBNodes = nilDBNodes
    }

    async init(seed: string) {


        this.signer = Signer.fromPrivateKey(seed);

        // NOTE: WaaP incorrectly requires `verifyingContract` in EIP-712 domain,
        // which violates the spec (it's optional per EIP-712).
        // This breaks off-chain signing protocols like Nillion that don't use a contract.```
        // this.signer = Signer.fromWeb3({
        //     getAddress: async () => address,
        //     signTypedData: async (params: any) : Promise<`0x${string}`> => {
        //         const primaryType = Object.keys(params.types).find((k: string) => k !== "EIP712Domain");
        //         const typedData = JSON.stringify({
        //             domain: params.domain,
        //             types: params.types,
        //             primaryType,
        //             message: params.message,
        //         });
        //         return window.waap.request({
        //             method: 'eth_signTypedData_v4',
        //             params: [address, typedData],
        //         }) as Promise<`0x${string}`>;
        //     },
        // });

        // console.log("NILLION SIGNER", this.signer)


        this.userDidString = (await this.signer.getDid()).didString;
        console.log('User DID:', this.userDidString);

        this.user = await SecretVaultUserClient.from({
            baseUrls: this.nilDBNodes.split(','),
            signer: this.signer,
            blindfold: {
                operation: 'store',
            },
        });

        console.log("NILLION USER:", this.user);

        console.log('owner (userDid):', this.userDidString);
        console.log('grantee (builderDid):', this.builderDid);
        console.log('signer DID type:', (await this.signer.getDid()).method);

    }

   


    // prepareAnswers(answers: SurveyAnswer[], config: Survey) {
    //     const result: Record<string, any> = {
    //         _id: randomUUID(),
    //         surveyId: config.id,
    //     };

    //     for (const answer of answers) {
    //         switch (answer.questionType) {
    //             case 'radio':
    //             case 'scale':
    //                 result[answer.questionId] = { "%allot": String(answer.answer) };
    //                 break;

    //             case 'checkbox':
    //                 const selected = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
    //                 // Find the question to get all options
    //                 const question = config.groups?.flatMap(g => g.questions).find(q => q.id === answer.questionId);
    //                 if (question?.options) {
    //                     question.options.forEach((option, i) => {
    //                         result[`${answer.questionId}_${i}`] = { "%allot": selected.includes(option) ? "1" : "0" };
    //                     });
    //                 }
    //                 break;

    //             case 'text':
    //                 result[answer.questionId] = String(answer.answer);
    //                 break;
    //         }
    //     }

    //     return result;
    // }



    async storeStandard(backendUrl: string, surveyId: string, userData: any, signature: Signature | `0x${string}`, signer: string) {

        // possibly perform blindfold encryption here 

        return await fetch(`${backendUrl}/api/surveys/${surveyId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                surveyId,
                userData,
                signature,
                signer
            })
        });
    }

    async storeOwned(uuid: string, config: Survey, answers: any, surveyId : string, delegationToken: string) {

            const userPrivateData = createUserDataObject(uuid, answers, config,"");

            try { 
          
                const uploadResults = await this.user.createData(
                    {
                        owner: this.userDidString,
                        acl: {
                            grantee: this.builderDid,
                            read: true,
                            write: false,
                            execute: true,
                        },
                        collection: "43a92ac7-7f7b-4b95-837a-6c1bd7da31af",
                        data: [userPrivateData],
                    },
                    { auth: { delegation: delegationToken } }
                );

                console.log('success', uploadResults);

            } catch (e: any) {
                console.log('error', JSON.stringify(e, null, 2));
                console.log('error message', e?.message);
                console.log('error cause', e?.cause);
                if (Array.isArray(e)) {
                    e.forEach((n, i) => console.log(`node ${i}`, JSON.stringify(n, null, 2)));
                }
            }

           const references = await this.user.listDataReferences();
           console.log(references);

    }

    async updateOwned(uuid: string, config: Survey, answers: any, surveyId: string, delegationToken: string, documentId: string) {

        const userPrivateData = createUserDataObject(uuid, answers, config,"");

        // Delete old data
        await this.user.deleteData({
            collection: surveyId,
            data: [userPrivateData],
            document: documentId
        });

        const uploadResults = await this.user.createData(
            {
                owner: this.userDidString,
                acl: {
                    grantee: this.builderDid,
                    read: true,
                    write: false,
                    execute: true,
                },
                collection: surveyId,
                data: [userPrivateData],
            },
            { auth: { delegation: delegationToken } }
        );

        console.log("updated", uploadResults)
    } 

    async getUserDelegationToken(signature: string, surveyId: string, backendUrl: string) {

        console.log('requesting delegation for DID:', this.userDidString);

        try {
            const response = await fetch(`${backendUrl}/api/surveys/${surveyId}/delegation`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
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
            console.log(typeof dtoken.delegation); // should be "string"
            const delegationToken = dtoken.delegation;

            return delegationToken;
        
        } catch (error) {
            console.error("Failed to get delegation token:", error);
            throw error;
        }
    }

    async getUserSurveyAnswers(surveyId: string) {
    try {
     
        const dataRefs = await this.user.listDataReferences();

        // Filter for this survey's collection
        const surveyDataRefs: any[] = dataRefs.data.filter((ref: any) => 
            ref.collection === surveyId
        );

        if (surveyDataRefs.length === 0) {
            console.log('No previous survey data found');
            return null;
        }

        console.log(surveyDataRefs[0]);

        // Read the user's survey data (should only be one per surveyId)
        const surveyData = await this.user.readData({
            collection: surveyId,
            document: surveyDataRefs[0].document// Get the first/only document
        });

        // Check if it matches the surveyId
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


