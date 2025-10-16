import { randomUUID } from 'node:crypto';
import { minaSurveyConfig } from './surveys/mina.js';

const NILCHAIN_URL = "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz";
const NILAUTH_URL = "https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz";
const NILDB_NODES = "https://nildb-stg-n1.nillion.network,https://nildb-stg-n2.nillion.network,https://nildb-stg-n3.nillion.network";
const BUILDER_PRIVATE_KEY = "c657ed5e26de39fe82b4fc006f68892234aed6f634fc7aba4ff6d9241eca488e";

// Import Nillion SDK components
import {
  Keypair,
  NilauthClient,
  PayerBuilder,
  NucTokenBuilder,
  Command,
} from '@nillion/nuc';
import {
    RunQueryRequest,
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';

// Configuration
const config = {
  NILCHAIN_URL: NILCHAIN_URL,
  NILAUTH_URL: NILAUTH_URL,
  NILDB_NODES: NILDB_NODES!.split(','),
  BUILDER_PRIVATE_KEY: BUILDER_PRIVATE_KEY,
};

// Validate configuration
// if (!config.BUILDER_PRIVATE_KEY) {
//   console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
//   process.exit(1);
// }

const COLLECTION = "e51a6f82-06b5-438f-915b-6a3c0a97cd86";

export class NilDBService {

    keypair: any;
    did: any;
    builder: any

    constructor () {

        this.keypair = Keypair.from(config.BUILDER_PRIVATE_KEY || "");
        this.did = this.keypair.toDid().toString();
        console.log('Builder DID:', this.did);
    }

    async init() {

        const payer = await new PayerBuilder()
            .keypair(this.keypair)
            .chainUrl(NILCHAIN_URL || "")
            .build();

        const nilauth = await NilauthClient.from(NILAUTH_URL || "", payer);


        this.builder = await SecretVaultBuilderClient.from({
            keypair: this.keypair,
            urls: {
                chain: NILCHAIN_URL || "",
                auth: NILAUTH_URL || "",
                dbs: NILDB_NODES.split(","),
            },
        });

        // Refresh token using existing subscription
        try {
            await this.builder.refreshRootToken();
            console.log('✅ Root token refreshed');
        } catch (tokenError) {
            console.log('⚠️ Token refresh failed, will attempt to continue');
        }

            // Try to read existing profile first
        try {
            const existingProfile = await this.builder.readProfile();
            console.log('✅ Builder already registered:', existingProfile.data.name);
            return; // Already registered, we're done!
        } catch (profileError: any) {
            console.log('⚠️ Could not read profile, attempting to register...');
        }

    // Try to register
        try {
            await this.builder.register({
                did: this.did,
                name: 'S3ntiment v1',
            });
            console.log('✅ Builder registered successfully');
        } catch (registerError: any) {
            // console.log('Full error:', JSON.stringify(registerError, null, 2));
            
            // Check if it's a duplicate key error (E11000 is MongoDB duplicate key error)
            let isDuplicate = false;
            
            if (Array.isArray(registerError)) {
                isDuplicate = registerError.some((err: any) => {
                    const errorStr = JSON.stringify(err);
                    return errorStr.includes('E11000') || 
                        errorStr.includes('duplicate key') ||
                        errorStr.includes('11000');
                });
            }

            if (isDuplicate) {
                console.log('✅ Builder already registered (duplicate key detected)');
                // Don't throw - this is expected and fine
            } else {
                // If it's not a duplicate error, throw it
                console.error('❌ Registration failed with unexpected error');
                throw registerError;
            }
        }
    
        console.log('✅ Initialization complete');
    }

    async createCollection (collection: any) {

        try {
            const createResults = await this.builder.createCollection(collection);
            console.log(createResults);
            console.log(
                '✅ Owned collection created on',
                Object.keys(createResults).length,
                'nodes'
            );
        } catch (error) {

            console.log(error)
            console.error('❌ Collection creation failed:', error.message);
            // Handle testnet infrastructure issues gracefully
        }
    }

    async tabulateSurveyResults(survey_id: string) {

        const records = await this.builder.findData({
            collection: COLLECTION,
            filter: { surveyId: survey_id },
        });

        console.log(`Processing ${records.data.length} responses`);

        // Group answers by question
        const questionMap = new Map();

        records.data.forEach((record: any) => {
            record.answers.forEach((answer: any) => {
                const questionId = answer.questionId;

                if (!questionMap.has(questionId)) {
                    questionMap.set(questionId, {
                        question: answer.questionText,
                        type: answer.questionType,
                        responses: []
                    });
                }

                // Extract the actual answer value from %share
                let answerValue = answer.answer;

                if (answerValue && typeof answerValue === 'object' && '%share' in answerValue) {
                    answerValue = answerValue['%share'];
                }

                // For checkbox, split comma-separated values
                const values = typeof answerValue === 'string' && answerValue.includes(',')
                    ? answerValue.split(',').map(v => v.trim())
                    : [answerValue];

                questionMap.get(questionId).responses.push(...values);
            });
        });

        // Tabulate results for each question
        const tabulated = Array.from(questionMap.entries()).map(([questionId, data]) => {
            // Count frequency of each answer
            const frequency = data.responses.reduce((acc: any, value: any) => {
                const key = String(value);
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

            // Calculate percentages
            const totalResponses = records.data.length;
            const results = Object.entries(frequency)
                .map(([answer, count]) => ({
                    answer,
                    count,
                    percentage: Math.round((count as number) / totalResponses * 100)
                }))
                .sort((a: any, b: any) => b.count - a.count);

            return {
                question: data.question,
                type: data.type,
                totalResponses,
                results
            };
        });

        console.log('Tabulation complete');
        return tabulated;

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
        

    async querySurvey (survey_id: string) {

        console.log("builder", this.did)

        const records = await this.builder.findData({
            collection: COLLECTION,
            filter: {}, // Empty filter returns all records
        });

       console.log("records", records.data)

      
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

//   console.log('Creating query with:', JSON.stringify(query, null, 2));

//   try {
//     const createResult = await this.builder.createQuery(query);
//     console.log('Query created successfully:', createResult);
//   } catch (error) {
//     console.error('Query creation failed');
//     console.error('Error message:', error.message);
//     console.error('Error cause:', JSON.stringify(error.cause, null, 2));
//     console.error('Error body:', JSON.stringify(error.cause?.body, null, 2));
//     throw error;
//   }

//   // Run the query
//   const runResponse = await this.builder.runQuery({
//     _id: queryId,
//     variables: {}
//   } as RunQueryRequest);

//   console.log('Run response:', runResponse);

//   // Extract run IDs from each node
//   const runIds = Object.fromEntries(
//     Object.entries(runResponse)
//       .filter(([_, r]: [any, any]) => r?.data)
//       .map(([nodeId, r]: [any, any]) => [nodeId, r.data])
//   );

//   console.log('Run IDs:', runIds);

//   // Poll for results
//   for (let i = 0; i < 10; i++) {
//     await new Promise((resolve) => setTimeout(resolve, i < 3 ? 1000 : 3000));

//     const resultsResponse = await this.builder.readQueryRunResults(runIds);
    
//     console.log(`Poll ${i + 1}:`, JSON.stringify(resultsResponse, null, 2));

//     const allResponses = Object.values(resultsResponse).filter((r: any) => r?.data);
    
//     const completed : any = allResponses.filter((r: any) => r.data.status === 'complete');
//     const pending = allResponses.some((r: any) => r.data.status === 'pending');
//     const errors: any[] = allResponses.filter((r: any) => r.data.status === 'error');

//     if (errors.length > 0) {
//       console.error('Query execution errors:', JSON.stringify(errors, null, 2));
//       throw new Error('Query failed: ' + JSON.stringify(errors[0].data.errors));
//     }

//     if (completed.length > 0 && !pending) {
//       const results = completed[0].data.result;
//       console.log('Query completed successfully:', results);
//       return results;
//     }
//   }
  
//   throw new Error('Query timeout after 10 attempts');


}

    delegateToken (user_did: any) {

        return NucTokenBuilder.extending(this.builder.rootToken)
            .command(new Command(['nil', 'db', 'data', 'create']))
            .audience(user_did)
            .expiresAt(Math.floor(Date.now() / 1000) + 3600) // 1 hour
            .build(this.keypair.privateKey());
    }
}