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

        const surveyResultsCollectionId = randomUUID();
        const surveyResultsCollection = {
            _id: surveyResultsCollectionId,
            type: 'owned',
            name: 'Survey Results Collection',
            schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'array',
                uniqueItems: true,
                items: {
                type: 'object',
                properties: {
                    _id: { 
                    type: 'string', 
                    format: 'uuid' 
                    },
                    surveyId: { 
                    type: 'string' // Filter by this for specific surveys
                    },
                    surveyTitle: { 
                    type: 'string'
                    },
                    timestamp: { 
                    type: 'string', 
                    format: 'date-time' 
                    },
                    answers: {
                    // Array of answer objects - secret shared
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                        questionId: { 
                            type: 'string' 
                        },
                        answer: {
                            // Secret shared answer - can be string, array, or number
                            type: "object",
                            properties: {
                            "%share": { 
                                type: "string" 
                            }
                            },
                            required: ["%share"]
                        }
                        },
                        required: ['questionId', 'answer']
                    }
                    }
                },
                required: ['_id', 'surveyId', 'timestamp', 'answers']
                }
            }
        }

        try {
            const createResults = await this.builder.createCollection(collection);
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

    delegateToken (user_did: any) {

        return NucTokenBuilder.extending(this.builder.rootToken)
            .command(new Command(['nil', 'db', 'data', 'create']))
            .audience(user_did)
            .expiresAt(Math.floor(Date.now() / 1000) + 3600 * 24 * 356) // 1 hour
            .build(this.keypair.privateKey());
    }
}