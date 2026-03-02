import {
  Signer,
} from '@nillion/nuc';
import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';
import { Survey, SurveyAnswer } from '../survey/types.js';



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
 
    constructor (builderDid: string, nilChainUrl: string, nilAuthUrl: string, nilDBNodes: string) { 

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
            // blindfold: {
            //     operation: 'store',
            // },
        });

        console.log("NILLION USER:", this.user);
    }

    prepareAnswers(answers: any) {
        return answers.map((answer: any) => {

        const answerValue = Array.isArray(answer.answer)
        ? answer.answer.join(',')
        : String(answer.answer);

        // Determine correct type based on question
        if (answer.questionType === 'radio') {
        // Radio: option index as integer
            const optionIndex = parseInt(answerValue, 10);
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
            answer: { "%allot": optionIndex }
            };
        }
        else if (answer.questionType === 'scale') {
        // Scale: rating as integer
            const rating = parseInt(answerValue, 10);
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: { "%allot": rating }
            };
        }
        else if (answer.questionType === 'checkbox') {
        // Checkbox: selected options array
        // Schema has question_id_0, question_id_1, etc.
            const selected = answerValue.split(',').map( (v: any) => parseInt(v.trim(), 10));
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: selected // Array of selected indices
            };
        }
        else {
        // Text: plain string
            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                questionType: answer.questionType,
                answer: answerValue
            };
        }
    });
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

    createUserDataObject(preparedAnswers: any, surveyId: string) {

        const dataObject: Record<string, any> = {
            _id: randomUUID(),
            surveyId
        };

        preparedAnswers.forEach((answer: any) => {
            if (answer.questionType === 'checkbox') {
            // [0, 2] → question_id_0: { "%allot": 1 }, question_id_1: { "%allot": 0 }, etc.
                const selectedIndices = answer.answer;
                const maxIndex = Math.max(...selectedIndices, 0);
                for (let i = 0; i <= maxIndex; i++) {
                    const fieldName = `${answer.questionId}_${i}`;
                    dataObject[fieldName] = { "%allot": selectedIndices.includes(i) ? 1 : 0 };
                }
            } else {
                dataObject[answer.questionId] = answer.answer;
            }
        });

        return dataObject


    }

    async store(config: Survey, answers: any, surveyId : string, delegationToken: string) {

            const preparedAnswers = this.prepareAnswers(answers);
            const userPrivateData = {
                _id: "f15287f3-861e-4eca-b44a-6f84e1dacbfe",
                question_1772463502473: { "%share": 0 },
            };
            
            console.log(userPrivateData)


            // console.log("📊 Full createData call:", {
            //     owner: this.userDidString,
            //     acl: { grantee: this.builderDid, read: true, execute: true },
            //     collection: surveyId, // Should be "d2620c23-bb8f-4dcc-b5d7-ee8fd58693a0"
            //     data: [userPrivateData]
            // });
            // console.log('surveyId', surveyId);
            // console.log('userDidString', this.userDidString);
            // console.log('builderDid', this.builderDid);

            try {

                const uploadResults = await this.user.createData(
                    {
                        owner: this.builderDid,
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

    async update(config: Survey, answers: any, surveyId: string, delegationToken: string, documentId: string) {

        console.log("updatin")

        const preparedAnswers = this.prepareAnswers(answers);

        const userPrivateData = {
            _id: documentId,
            surveyId,
            answers: preparedAnswers
        };

        // console.log(userPrivateData);
        // console.log("builder", import.meta.env.VITE_NIL_BUILDER_DID)
        // console.log("collection", import.meta.env.VITE_S3_COLLECTION_ID)

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
            const response = await fetch(`${backendUrl}/api/request-user-delegation`, {
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

