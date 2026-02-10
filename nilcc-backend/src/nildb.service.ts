import { NilauthClient } from "@nillion/nilauth-client";
import {
  Builder,
  Signer,
  Did,
  Command,
} from '@nillion/nuc';

import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
  NucCmd
} from '@nillion/secretvaults';
import { SurveyConfig } from './types';
import { randomUUID } from "crypto";


const NILCHAIN_URL = "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz";
const NILAUTH_URL = "https://nilauth-1bc3.staging.nillion.network"; // "https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz";
const NILDB_NODES = "https://nildb-stg-n1.nillion.network,https://nildb-stg-n2.nillion.network,https://nildb-stg-n3.nillion.network";
const CHAINID = 11155111;


// Configuration
const config = {
  NILCHAIN_URL: NILCHAIN_URL,
  NILAUTH_URL: NILAUTH_URL,
  NILDB_NODES: NILDB_NODES!.split(','),
  CHAINID: CHAINID
};

// Validate configuration
// if (!config.BUILDER_PRIVATE_KEY) {
//   console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
//   process.exit(1);
// }


export class NilDBService {

    builderKey: string;
    builderSigner: Signer;
    builderDid: Did | undefined;
    builderClient: any;
    nildbTokens: any;
  

    constructor () {
        this.builderKey = process.env.BUILDER_PRIVATE_KEY || "";
        this.builderSigner = Signer.fromPrivateKey(this.builderKey);
    }


    async initBuilder () {

    
        this.builderDid = await this.builderSigner.getDid();
        console.log('Builder DID:', this.builderDid.didString);

         const nilauthClient = await NilauthClient.create({
            baseUrl: config.NILAUTH_URL,
            chainId: config.CHAINID,
        });
        console.log("✅ Nilauth client created");

        const status = await nilauthClient.subscriptionStatus(
            this.builderDid,  // Your builder's DID
            'nildb'           // The blind module
        );

        console.log("subscription", status)

        this.builderClient = await SecretVaultBuilderClient.from({
            signer: this.builderSigner,
            nilauthClient,
            dbs: config.NILDB_NODES,
            blindfold: { operation: "store" },  // Enable encryption for %allot fields
        });

        await this.builderClient.refreshRootToken();
        const rootToken = this.builderClient.rootToken;  // This is already the envelope object ✅

        // Create invocation tokens for each node
        this.nildbTokens = {};
        for (const node of this.builderClient.nodes) {
            this.nildbTokens[node.id.didString] = await Builder.invocationFrom(rootToken)  // Use rootToken directly
                .audience(node.id)
                .command(NucCmd.nil.db.root)
                .expiresIn(86400)  // Note: expiresIn is in SECONDS, not milliseconds
                .signAndSerialize(this.builderSigner);
        }
    }

    // async createSurveyOwner(surveyOwner: Signer) {

    //     return await SecretVaultUserClient.from({
    //         baseUrls: config.NILDB_NODES,
    //         signer: surveyOwner,
    //         blindfold: { operation: 'store' },
    //     });
    // }


    // async delegateToSurveyOwner(ownerDid: Did) {
    //     const delegation = await Builder.delegationFrom(this.builder.rootToken)
    //         .audience(ownerDid)
    //         .expiresIn(3600 * 1000)
    //         .sign(this.builderSigner);
            
    //     return delegation;
    // }

    async createSurveyCollection(schema: any, surveyOwnerDid: any) {

        const collectionId = randomUUID();
        await this.builderClient.createCollection({
            _id: collectionId,
            owner: surveyOwnerDid,  // ← Owned by survey owner, not builder
            schema,
        });

        return collectionId;
    }

    async getDelegation(surveyOwnerDid: any, collectionId: string) {

        return await Builder.delegation()
            .audience(surveyOwnerDid)
            .command("/nil/db/data/read")
            .policy([
                ["==", ".command", "/nil/db/data/read"],
                ["==", ".args.collection", collectionId]  // Constrain via policy instead
            ])
            .expiresIn(365 * 24 * 3600)
            .sign(this.builderSigner);
    }


    async tabulateSurveyResults(survey_id: string, keypair : any) {

        // const radioSum = await blindfold.sum(responses.map(r => r.question_1765188018511));

        // // SUM per checkbox optie → hoeveel kozen "rice"
        // const riceCount = await blindfold.sum(responses.map(r => r.question_1765188080959_0));
        // const pastaCount = await blindfold.sum(responses.map(r => r.question_1765188080959_1));

        // // SUM scale → bereken gemiddelde client-side
        // const scaleSum = await blindfold.sum(responses.map(r => r.question_1765188127232));
        // const scaleAvg = scaleSum / responseCount;

 
        let ownerDid = keypair.toDid().toString();
        console.log('Owner DID:', ownerDid);

        // moet ik hier nog initialiseren ???? 
        // mm wordt sowieso anders .. want we gaan weer blind compute gebruiken 

        // const records = await this.builder.findData({
        //     collection: COLLECTION,
        //     filter: { surveyId: survey_id },
        // });

        // console.log(`Processing ${records.data.length} responses`);

        // // Group answers by question
        // const questionMap = new Map();

        // records.data.forEach((record: any) => {
        //     record.answers.forEach((answer: any) => {
        //         const questionId = answer.questionId;

        //         if (!questionMap.has(questionId)) {
        //             questionMap.set(questionId, {
        //                 question: answer.questionText,
        //                 type: answer.questionType,
        //                 responses: []
        //             });
        //         }

        //         // Extract the actual answer value from %share
        //         let answerValue = answer.answer;

        //         if (answerValue && typeof answerValue === 'object' && '%share' in answerValue) {
        //             answerValue = answerValue['%share'];
        //         }

        //         // For checkbox, split comma-separated values
        //         const values = typeof answerValue === 'string' && answerValue.includes(',')
        //             ? answerValue.split(',').map(v => v.trim())
        //             : [answerValue];

        //         questionMap.get(questionId).responses.push(...values);
        //     });
        // });

        // // Tabulate results for each question
        // const tabulated = Array.from(questionMap.entries()).map(([questionId, data]) => {
        //     // Count frequency of each answer
        //     const frequency = data.responses.reduce((acc: any, value: any) => {
        //         const key = String(value);
        //         acc[key] = (acc[key] || 0) + 1;
        //         return acc;
        //     }, {});

        //     // Calculate percentages
        //     const totalResponses = records.data.length;
        //     const results = Object.entries(frequency)
        //         .map(([answer, count]) => ({
        //             answer,
        //             count,
        //             percentage: Math.round((count as number) / totalResponses * 100)
        //         }))
        //         .sort((a: any, b: any) => b.count - a.count);

        //     return {
        //         question: data.question,
        //         type: data.type,
        //         totalResponses,
        //         results
        //     };
        // });

        // console.log('Tabulation complete');
        // return tabulated;

        // console.log(`Tabulating results for survey: ${survey_id}`);
        
        // // Get the survey config (you could also store this in the database)
        // const surveyConfig = minaSurveyConfig; // Or fetch based on survey_id
        
        // const queryId = randomUUID();
        
        // const query = {
        //     _id: queryId,
        //     name: 'tabulate_survey_results',
        //     collection: COLLECTION,
        //     pipeline: [
        //         { $match: { surveyId: survey_id } },
        //         { $unwind: '$answers' },
        //         {
        //             $group: {
        //                 _id: {
        //                     questionId: '$answers.questionId',
        //                     answer: '$answers.answer'
        //                 },
        //                 count: { $sum: 1 },
        //                 questionText: { $first: '$answers.questionText' },
        //                 questionType: { $first: '$answers.questionType' }
        //             }
        //         },
        //         {
        //             $group: {
        //                 _id: '$_id.questionId',
        //                 question: { $first: '$questionText' },
        //                 type: { $first: '$questionType' },
        //                 results: {
        //                     $push: {
        //                         answer: '$_id.answer',
        //                         count: '$count'
        //                     }
        //                 }
        //             }
        //         }
        //     ],
        //     variables: {}
        // };
        
        // console.log('Creating query...');
        
        // try {
        //     await this.builder.createQuery(query);
            
        //     const runResponse = await this.builder.runQuery({
        //         _id: queryId,
        //         variables: {}
        //     });
            
        //     const runIds = Object.fromEntries(
        //         Object.entries(runResponse)
        //             .filter(([_, r]: [any, any]) => r?.data)
        //             .map(([nodeId, r]: [any, any]) => [nodeId, r.data])
        //     );
            
        //     // Poll for results
        //     for (let i = 0; i < 20; i++) {
        //         await new Promise(resolve => setTimeout(resolve, i < 3 ? 1000 : 3000));
                
        //         const resultsResponse = await this.builder.readQueryRunResults(runIds);
        //         const allResponses = Object.values(resultsResponse).filter((r: any) => r?.data);
        //         const completed: any = allResponses.filter((r: any) => r.data.status === 'complete');
        //         const pending = allResponses.some((r: any) => r.data.status === 'pending');
        //         const errors: any[] = allResponses.filter((r: any) => r.data.status === 'error');
                
        //         if (errors.length > 0) {
        //             console.error('Query errors:', JSON.stringify(errors, null, 2));
        //             throw new Error('Query failed: ' + JSON.stringify(errors[0].data.errors));
        //         }
                
        //         if (completed.length > 0 && !pending) {
        //             const queryResults = completed[0].data.result;
                    
        //             // Get total number of responses
        //             const totalResponsesResult = await this.builder.findData({
        //                 collection: COLLECTION,
        //                 filter: { surveyId: survey_id }
        //             });
        //             const totalResponses = totalResponsesResult.data.length;
                    
        //             // Merge with survey config to include all options
        //             const tabulatedResults = surveyConfig.questions.map((questionConfig) => {
        //                 const queryResult = queryResults.find((r: any) => r._id === questionConfig.id);
                        
        //                 if (!queryResult) {
        //                     // No responses for this question yet
        //                     return {
        //                         questionId: questionConfig.id,
        //                         question: questionConfig.question,
        //                         type: questionConfig.type,
        //                         totalResponses: 0,
        //                         results: questionConfig.options?.map(option => ({
        //                             answer: option,
        //                             count: 0,
        //                             percentage: 0
        //                         })) || []
        //                     };
        //                 }
                        
        //                 // For questions with predefined options (radio, checkbox)
        //                 if (questionConfig.options) {
        //                     const resultMap: any  = new Map(
        //                         queryResult.results.map((r: any) => [r.answer, r.count])
        //                     );
                            
        //                     const completeResults = questionConfig.options.map((option: string) => ({
        //                         answer: option,
        //                         count: resultMap.get(option) || 0,
        //                         percentage: Math.round(((resultMap.get(option) || 0) / totalResponses) * 100)
        //                     })).sort((a, b) => b.count - a.count);
                            
        //                     return {
        //                         questionId: questionConfig.id,
        //                         question: questionConfig.question,
        //                         type: questionConfig.type,
        //                         totalResponses,
        //                         results: completeResults
        //                     };
        //                 }
                        
        //                 // For scale questions
        //                 if (questionConfig.type === 'scale') {
        //                     const results = queryResult.results.map((r: any) => ({
        //                         answer: r.answer,
        //                         count: r.count,
        //                         percentage: Math.round((r.count / totalResponses) * 100)
        //                     })).sort((a: any, b: any) => Number(a.answer) - Number(b.answer));
                            
        //                     // Calculate average for scale questions
        //                     const sum = results.reduce((acc: number, r: any) => 
        //                         acc + (Number(r.answer) * r.count), 0
        //                     );
        //                     const average = sum / totalResponses;
                            
        //                     return {
        //                         questionId: questionConfig.id,
        //                         question: questionConfig.question,
        //                         type: questionConfig.type,
        //                         scaleRange: questionConfig.scaleRange,
        //                         totalResponses,
        //                         average: Math.round(average * 10) / 10,
        //                         results
        //                     };
        //                 }
                        
        //                 return {
        //                     questionId: questionConfig.id,
        //                     question: questionConfig.question,
        //                     type: questionConfig.type,
        //                     totalResponses,
        //                     results: queryResult.results
        //                 };
        //             });
                    
        //             console.log('Tabulation complete');
        //             return tabulatedResults;
        //         }
        //     }
            
        //     throw new Error('Query timeout after 20 attempts');
            
        // } catch (error) {
        //     console.error('Tabulation failed:', error);
        //     throw error;
        // }
    }


    // async tabulateSurveyResults(survey_id: string) {

    //     console.log(`Tabulating results for survey: ${survey_id}`);

    //     console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this.builder)));

        
    //     // First, find the record IDs
    //     const records = await this.builder.findData({
    //         collection: COLLECTION,
    //         filter: { surveyId: survey_id },
    //     });

    //     console.log(`Found ${records.data.length} responses`);

    //     // Group answers by question
    //     const questionMap = new Map();

    //     // Now you need to read each record properly to get decrypted data
    //     // The builder needs to use its credentials to retrieve and decrypt
    //     for (const record of records.data) {
    //         // Use getData or similar method that actually reconstructs the shares
    //         // This should be done with the builder's credentials since it has read access
    //         const decryptedRecord = await this.builder.getData({
    //             collection: COLLECTION,
    //             recordId: record._id,
    //         });

    //         decryptedRecord.answers.forEach((answer: any) => {
    //             const questionId = answer.questionId;
                
    //             if (!questionMap.has(questionId)) {
    //                 questionMap.set(questionId, {
    //                     question: answer.questionText,
    //                     type: answer.questionType,
    //                     responses: []
    //                 });
    //             }
                
    //             // Answer should now be decrypted
    //             let answerValue = answer.answer;
                
    //             console.log('Decrypted value:', answerValue);
                
    //             // For checkbox, split comma-separated values
    //             const values = typeof answerValue === 'string' && answerValue.includes(',')
    //                 ? answerValue.split(',').map(v => v.trim())
    //                 : [answerValue];
                
    //             questionMap.get(questionId).responses.push(...values);
    //         });
    //     }

    //     // Rest of tabulation...
    //     const tabulated = Array.from(questionMap.entries()).map(([questionId, data]) => {
    //         const frequency = data.responses.reduce((acc: any, value: any) => {
    //             const key = String(value);
    //             acc[key] = (acc[key] || 0) + 1;
    //             return acc;
    //         }, {});

    //         const totalResponses = records.data.length;
    //         const results = Object.entries(frequency)
    //             .map(([answer, count]) => ({
    //                 answer,
    //                 count,
    //                 percentage: Math.round((count as number) / totalResponses * 100)
    //             }))
    //             .sort((a: any, b: any) => b.count - a.count);

    //         return {
    //             question: data.question,
    //             type: data.type,
    //             totalResponses,
    //             results
    //         };
    //     });

    //     console.log('Tabulation complete');
    //     return tabulated;
    // }
        

   
      
//         // const query = {
//         //     _id: randomUUID(),
//         //     name: 'read all results',
//         //     collection: COLLECTION,
//         //     pipeline: [
//         //         { $match: { _id: { $exists: true } } }// Match everything
//         //     ],
//         //     variables: {}
//         // };
          
//         const queryId = randomUUID();
  
//   // Try the most minimal query first
//   const query = {
//     _id: queryId,
//     name: 'read survey results',
//     collection: COLLECTION,
//     variables: {}, // Empty but present
//     pipeline: [
//       { 
//         $match: { 
//           surveyId: survey_id
//         } 
//       }
//     ]
//   };


   
}