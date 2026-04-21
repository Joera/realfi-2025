import { NilauthClient } from "@nillion/nilauth-client";
import {
  Builder,
  Signer,
  Did,
  Codec
} from '@nillion/nuc';

import {
  SecretVaultBuilderClient,
  SecretVaultUserClient,
  NucCmd
} from '@nillion/secretvaults';
import { QuestionGroup, Survey, tallyResults } from "@s3ntiment/shared";
import { decrypt, encrypt } from "eciesjs";
import { Signature, verifyMessage } from "viem";



// Configuration
const config = {
  BUILDER_KEY:  process.env.VITE_NIL_BUILDER_PRIVATE_KEY || "",
  NILCHAIN_URL: process.env.VITE_NILCHAIN_URL,
  NILAUTH_URL: process.env.VITE_NILAUTH_URL || "",
  NILDB_NODES: (process.env.VITE_NILDB_NODES || "").split(','),
  CHAINID: parseInt(process.env.VITE_NIL_CHAINID || "1")
};

console.log(config);


export class NilDBBuilderService {

    builderKey: string;
    builderSigner: Signer;
    builderDid: Did | undefined;
    builderClient: any;
    nildbRootTokens: any;
    nildbReadTokens: any;

    constructor () {
        this.builderKey = config.BUILDER_KEY;
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

        // try {
        //     const profile = await this.builderClient.readProfile();
        //     // console.log('✅ Builder already registered:', profile);
        // } catch (e) {
        //     console.log('Registering builder...');
        //     try {
        //         await this.builderClient.register({
        //             did: this.builderDid!.didString,
        //             name: 'S3ntiment Builder',
        //         });
        //         console.log('✅ Builder registered');
        //     } catch (regError: any) {
        //         if (regError?.message?.includes('duplicate key')) {
        //             console.log('✅ Builder already registered (duplicate key)');
        //         } else {
        //             throw regError;
        //         }
        //     }
        // }

        // Create invocation tokens for each node
        this.nildbRootTokens = {};
        for (const node of this.builderClient.nodes) {
            this.nildbRootTokens[node.id.didString] = await Builder.invocationFrom(rootToken)  // Use rootToken directly
                .audience(node.id)
                .command(NucCmd.nil.db.root)
                .expiresIn(86400)  // Note: expiresIn is in SECONDS, not milliseconds
                .signAndSerialize(this.builderSigner);
        }
    }

    async getReadTokens() {

        const nildbReadTokens: any = {};
        for (const node of this.builderClient.nodes) {
            nildbReadTokens[node.id.didString] = await Builder.invocationFrom(this.builderClient.rootToken)  // Use rootToken directly
                .audience(node.id)
                .command(NucCmd.nil.db.data.read)
                .expiresIn(86400)  // Note: expiresIn is in SECONDS, not milliseconds
                .signAndSerialize(this.builderSigner);
        }

        return nildbReadTokens;
    }

    // async delegateToSurveyOwner(ownerDid: Did) {
    //     const delegation = await Builder.delegationFrom(this.builder.rootToken)
    //         .audience(ownerDid)
    //         .expiresIn(3600 * 1000)
    //         .sign(this.builderSigner);
            
    //     return delegation;
    // }

    async createSurveyCollection(id: string, rawSchema: any, surveyOwnerDid: any) {
        try {
            const result = await this.builderClient.createCollection({
                _id: id,
                name: rawSchema.name,
                type: rawSchema.type,
                schema: rawSchema.schema,
                owner: this.builderDid!.didString  // surveyOwnerDid,
            });
            console.log("collection created", result);
            return id;
        } catch (e: any) {
            throw e; // don't swallow it
        }
    }



    async submitResponseForUser (surveyId: string, userData: any) {


        const existingDocIds = await this.exists(surveyId,userData.signer);

        console.log("Existing", existingDocIds);

        if (  existingDocIds && existingDocIds.length > 0) {

            for (const id of existingDocIds) {
            
                const d = await this.builderClient.deleteData(
                    {
                    collection: surveyId,
                    filter: { _id: id },
                    }
                );

                console.log("deleted", d)
            }
        }
   
        try {
            return await this.builderClient.createStandardData({
                collection: surveyId,
                data: [userData]
                },
            );
        } catch (e: any) {
            if (Array.isArray(e)) {
                e.forEach((err, i) => {
                    console.error(`Node ${i}:`, JSON.stringify(err, null, 2));
                     console.error('Cause:', err.cause);
                });
            } else {
                console.error('Full error:', JSON.stringify(e, null, 2));
            }
            throw e;
        }
    }

    async getUserWriteDelegation(didString: string, surveyId: string) {


        console.log('builderRootToken:', this.builderClient.rootToken ? 'present' : 'MISSING');
        console.log('builderSigner:', this.builderSigner ? 'present' : 'MISSING');

        console.log('collection', surveyId)

        const userDid = Did.parse(didString);

        console.log('issuing delegation to DID:', userDid);

        const delegation = await Builder.delegationFrom(this.builderClient.rootToken)
            .audience(userDid)
            .command(NucCmd.nil.db.data.create)
            .expiresIn(3600)
            .sign(this.builderSigner);

        const serialized = Codec.serializeBase64Url(delegation);

        const parts = serialized.split('/');
        const payloadB64 = parts[0].split('.')[1];
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
        console.log('delegation payload:', JSON.stringify(payload, null, 2));
        console.log('proof chain length:', parts.length);

        return serialized;
    
    }

    

    async getOwnerReadDelegation(surveyOwnerDid: Did, surveyId: string) {
        return await Builder.delegation()
            .audience(surveyOwnerDid)
            .command("/nil/db/data/read")
            .policy([
                ["==", ".args.collection", surveyId]
            ])
            .expiresIn(365 * 24 * 3600)
            .sign(this.builderSigner);
    }


    async findSurveyResults(surveyId: string, groups: QuestionGroup[], signature : any) {


        // run checks isOwner
        await new Promise(r => setTimeout(r, 5000));

        try {

            const rawResults = await this.builderClient.findData(
                {
                    collection: surveyId,
                    filter: {}
                },
                { 
                    auth: { invocations: await this.getReadTokens() }
                }
            );

            /// pagination on 1000 records!!!!!
            
            // console.log(rawResults)

            try  {
                const talliedResults = tallyResults(rawResults.data, groups);
                // console.log(talliedResults);
                return talliedResults

            } catch (error) {

                console.log("error tallying", error)
            }

        } catch (error) {

            console.log("error", JSON.stringify(error));
            return { result : false};
        }
    }


    async exists(surveyId: string, signer: string) {

        const rawResults = await this.builderClient.findData(
            {
                collection: surveyId,
                filter: { signer: signer}
            },
            { 
                auth: { invocations: await this.getReadTokens() }
            }
        );
        
        return rawResults.data[0] ? rawResults.data.map( (r: any) => r._id) : false;
    }
  
    

    async getResponseById(surveyId: string, docId: string) {

        const rawResults = await this.builderClient.findData(
                {
                    collection: surveyId,
                    filter: { _id: docId}
                },
                { 
                    auth: { invocations: await this.getReadTokens() }
                }
            );

        return rawResults.data[0];

    }

    encryptToBuilder(data: any): string {
        const message = Buffer.from(JSON.stringify(data))
        const pubKeyBytes = (this.builderDid as any).publicKeyBytes
        const pubKeyHex = Buffer.from(pubKeyBytes).toString('hex')
        const encrypted = encrypt(pubKeyHex, message)
        return Buffer.from(encrypted).toString('base64')
    }

    decryptFromBuilder(encryptedBase64: string): any {
        const encrypted = new Uint8Array(Buffer.from(encryptedBase64, 'base64'))
        const decrypted = decrypt(this.builderKey, encrypted)
        return JSON.parse(Buffer.from(decrypted).toString())
    }
}