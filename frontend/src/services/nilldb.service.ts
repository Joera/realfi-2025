

// Import Nillion SDK components
import {
  Keypair,
  NilauthClient,
  PayerBuilder,
  NucTokenBuilder,
  Command,
} from '@nillion/nuc';
import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
} from '@nillion/secretvaults';

// Configuration
const config = {
  NILCHAIN_URL: import.meta.env.VITE_NILCHAIN_URL,
  NILAUTH_URL: import.meta.env.VITE_NILAUTH_URL,
  NILDB_NODES: import.meta.env.VITE_NILDB_NODES.split(','),
}

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


export class NillionService {

    builderKeypair: any
    userKeypair: any;
    user: any;
    payer: any;
    nilauth: any;
    builderDid: any;
 
    constructor (private_key: string) { 

        this.userKeypair = Keypair.from(private_key);
        const userDid = this.userKeypair.toDid().toString();
        console.log('User DID:', userDid);
    }

    async init() {

        this.user = await SecretVaultUserClient.from({
            baseUrls: config.NILDB_NODES,
            keypair: this.userKeypair,
            blindfold: {
                operation: 'store',
            },
        });
    }

    prepareAnswers (answers: any) {

        return answers.map( (answer : any) => ({
            questionId: answer.questionId,
            questionText: answer.questionText, // Must include
            questionType: answer.questionType, // Must include
            answer: {
            "%allot": Array.isArray(answer.answer) 
                ? answer.answer.join(',')
                : String(answer.answer)
            }
        }));

    }

    async store(answers: any, surveyId : string) {

        // is signature 
        
            const delegationToken = await this.getDelegationToken(this.userKeypair.toDid().toString(),"")
            const preparedAnswers = this.prepareAnswers(answers);

            const userPrivateData = {
                _id: randomUUID(),
                surveyId,
                answers: preparedAnswers
            };

            // console.log(userPrivateData);
            // console.log("builder", import.meta.env.VITE_NIL_BUILDER_DID)
            // console.log("collection", import.meta.env.VITE_S3_COLLECTION_ID)

            const uploadResults = await this.user.createData(delegationToken, {
                owner: this.userKeypair.toDid().toString(),
                acl: {
                    grantee: import.meta.env.VITE_NIL_BUILDER_DID, // Grant access to the builder
                    read: true, // Builder can read the data
                    write: false, // Builder cannot modify the data
                    execute: true, // Builder can run queries on the data
                },
                collection: import.meta.env.VITE_S3_COLLECTION_ID,
                data: [userPrivateData],
            });

            console.log("stored",uploadResults)

           const references = await this.user.listDataReferences();
           console.log(references);

    }

    async update(answers: any, surveyId: string, documentId: string) {

        const delegationToken = await this.getDelegationToken(this.userKeypair.toDid().toString(),"")
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
            collection: import.meta.env.VITE_S3_COLLECTION_ID,
            data: [userPrivateData],
            document: documentId
        });

        const uploadResults = await this.user.createData(delegationToken, {
            owner: this.userKeypair.toDid().toString(),
            acl: {
                grantee: import.meta.env.VITE_NIL_BUILDER_DID, // Grant access to the builder
                read: true, // Builder can read the data
                write: false, // Builder cannot modify the data
                execute: true, // Builder can run queries on the data
            },
            collection: import.meta.env.VITE_S3_COLLECTION_ID,
            data: [userPrivateData],
        });

        console.log("updated", uploadResults)

  
    } 

    async getDelegationToken(did: string, signature: string) {
        try {
            const response = await fetch("https://nillion-app.composible.io/api/delegate-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                did,
                signature
            })
            });

            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        
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
            ref.collection === import.meta.env.VITE_S3_COLLECTION_ID
        );

        if (surveyDataRefs.length === 0) {
            console.log('No previous survey data found');
            return null;
        }

        console.log(surveyDataRefs[0]);

        // Read the user's survey data (should only be one per surveyId)
        const surveyData = await this.user.readData({
            collection: import.meta.env.VITE_S3_COLLECTION_ID,
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

