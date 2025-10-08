import { randomUUID } from 'node:crypto';
import { config as loadEnv } from 'dotenv';

// Load environment variables
loadEnv();

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
  NILCHAIN_URL: process.env.NILCHAIN_URL,
  NILAUTH_URL: process.env.NILAUTH_URL,
  NILDB_NODES: process.env.NILDB_NODES!.split(','),
  BUILDER_PRIVATE_KEY: process.env.BUILDER_PRIVATE_KEY,
};

// Validate configuration
if (!config.BUILDER_PRIVATE_KEY) {
  console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
  process.exit(1);
}

const COLLECTION = "8840cd79-ab26-4773-9d9f-ac94b1fc5f33";

export class NillionService {

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
            .chainUrl(config.NILCHAIN_URL || "")
            .build();

        const nilauth = await NilauthClient.from(config.NILAUTH_URL || "", payer);

        this.builder = await SecretVaultBuilderClient.from({
            keypair: this.keypair,
            urls: {
                chain: config.NILCHAIN_URL || "",
                auth: config.NILAUTH_URL || "",
                dbs: config.NILDB_NODES,
            },
        });

        // Refresh token using existing subscription
        await this.builder.refreshRootToken();

        try {
            const existingProfile = await this.builder.readProfile();
            console.log('✅ Builder already registered:', existingProfile.data.name);
            } catch (profileError: any) {
            try {
                await this.builder.register({
                did: this.did,
                name: 'S3ntiment v1',
                });
                console.log('✅ Builder registered successfully');
            } catch (registerError) {
                // Handle duplicate key errors gracefully
                if (registerError.message.includes('duplicate key')) {
                console.log('✅ Builder already registered (duplicate key)');
                } else {
                throw registerError;
                }
            }
        }

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
            console.error('❌ Collection creation failed:', error.message);
            // Handle testnet infrastructure issues gracefully
        }
    }

    async querySurvey (survey_id: string) {

        console.log("builder", this.did)

        const records = await this.builder.findData({
            collection: COLLECTION,
            filter: {}, // Empty filter returns all records
        });

       console.log("records", records.data)

        // const query = {
        //     _id: randomUUID(),
        //     name: 'read all results',
        //     collection: COLLECTION,
        //     pipeline: [
        //         { $match: { _id: { $exists: true } } }// Match everything
        //     ],
        //     variables: {}
        // };
          
        const queryId = randomUUID();
  
  // Try the most minimal query first
  const query = {
    _id: queryId,
    name: 'read survey results',
    collection: COLLECTION,
    variables: {}, // Empty but present
    pipeline: [
      { 
        $match: { 
          surveyId: survey_id
        } 
      }
    ]
  };

  console.log('Creating query with:', JSON.stringify(query, null, 2));

  try {
    const createResult = await this.builder.createQuery(query);
    console.log('Query created successfully:', createResult);
  } catch (error) {
    console.error('Query creation failed');
    console.error('Error message:', error.message);
    console.error('Error cause:', JSON.stringify(error.cause, null, 2));
    console.error('Error body:', JSON.stringify(error.cause?.body, null, 2));
    throw error;
  }

  // Run the query
  const runResponse = await this.builder.runQuery({
    _id: queryId,
    variables: {}
  } as RunQueryRequest);

  console.log('Run response:', runResponse);

  // Extract run IDs from each node
  const runIds = Object.fromEntries(
    Object.entries(runResponse)
      .filter(([_, r]: [any, any]) => r?.data)
      .map(([nodeId, r]: [any, any]) => [nodeId, r.data])
  );

  console.log('Run IDs:', runIds);

  // Poll for results
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, i < 3 ? 1000 : 3000));

    const resultsResponse = await this.builder.readQueryRunResults(runIds);
    
    console.log(`Poll ${i + 1}:`, JSON.stringify(resultsResponse, null, 2));

    const allResponses = Object.values(resultsResponse).filter((r: any) => r?.data);
    
    const completed : any = allResponses.filter((r: any) => r.data.status === 'complete');
    const pending = allResponses.some((r: any) => r.data.status === 'pending');
    const errors: any[] = allResponses.filter((r: any) => r.data.status === 'error');

    if (errors.length > 0) {
      console.error('Query execution errors:', JSON.stringify(errors, null, 2));
      throw new Error('Query failed: ' + JSON.stringify(errors[0].data.errors));
    }

    if (completed.length > 0 && !pending) {
      const results = completed[0].data.result;
      console.log('Query completed successfully:', results);
      return results;
    }
  }
  
  throw new Error('Query timeout after 10 attempts');


}

    delegateToken (user_did: any) {

        return NucTokenBuilder.extending(this.builder.rootToken)
            .command(new Command(['nil', 'db', 'data', 'create']))
            .audience(user_did)
            .expiresAt(Math.floor(Date.now() / 1000) + 3600) // 1 hour
            .build(this.keypair.privateKey());
    }
}