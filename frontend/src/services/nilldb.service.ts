// import { randomUUID } from 'node:crypto';

// // Import Nillion SDK components
// import {
//   Keypair,
//   NilauthClient,
//   PayerBuilder,
//   NucTokenBuilder,
//   Command,
// } from '@nillion/nuc';
// import {
//   SecretVaultBuilderClient,
//   SecretVaultUserClient,
// } from '@nillion/secretvaults';

// // Configuration
// const config = {
//   NILCHAIN_URL: import.meta.env.VITE_NILCHAIN_URL,
//   NILAUTH_URL: import.meta.env.VITE_NILAUTH_URL,
//   NILDB_NODES: import.meta.env.VITE_NILDB_NODES.split(','),
//   BUILDER_PRIVATE_KEY: import.meta.env.VITE_NIL_builder_PRIVATE_KEY,
// };

// // Validate configuration
// if (!config.BUILDER_PRIVATE_KEY) {
//   console.error('❌ Please set BUILDER_PRIVATE_KEY in your .env file');
//   process.exit(1);
// }

// export class NillionService {

//     builderKeypair: any
//     userKeypair: any;
//     payer: any;
//     nilauth: any;
//     builderDid: any;
 
//     constructor (private_key: string) { 

//         this.builderKeypair = Keypair.from(config.BUILDER_PRIVATE_KEY); // Use your funded key
//         this.userKeypair = Keypair.from(private_key);

//         this.builderDid = this.builderKeypair.toDid().toString();
//         const userDid = this.userKeypair.toDid().toString();

//         console.log('Builder DID:', this.builderDid);
//         console.log('User DID:', userDid);
//     }

//     async init() {
        
//         this.payer = await new PayerBuilder()
//             .keypair(this.builderKeypair)
//             .chainUrl(config.NILCHAIN_URL)
//             .build();

//         this.nilauth = await NilauthClient.from(config.NILAUTH_URL, this.payer);

//         const builder = await SecretVaultBuilderClient.from({
//             keypair: this.builderKeypair,
//             urls: {
//                 chain: config.NILCHAIN_URL,
//                 auth: config.NILAUTH_URL,
//                 dbs: config.NILDB_NODES,
//             },
//         });

//         // Refresh token using existing subscription
//         await builder.refreshRootToken();

//         try {
//             const existingProfile = await builder.readProfile();
//             console.log('✅ Builder already registered:', existingProfile.data.name);
//             } catch (profileError) {
//             try {
//                 await builder.register({
//                 did: this.builderDid,
//                 name: 'My Demo Builder',
//                 });
//                 console.log('✅ Builder registered successfully');
//             } catch (registerError: any) {
//                 // Handle duplicate key errors gracefully
//                 if (registerError.message.includes('duplicate key')) {
//                 console.log('✅ Builder already registered (duplicate key)');
//                 } else {
//                 throw registerError;
//                 }
//             }
//         }

//     }


// }

