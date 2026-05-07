import {
  Builder,
  Signer,
  Did,
  Codec,
  Command
} from '@nillion/nuc';

import {
  SecretVaultBuilderClient,
  NucCmd
} from '@nillion/secretvaults';
import { QuestionGroup, tallyResults } from "@s3ntiment/shared";
import { decrypt, encrypt } from "eciesjs";

const config = {
  BUILDER_KEY: process.env.VITE_NIL_BUILDER_PRIVATE_KEY || "",
  NILDB_NODES: (process.env.VITE_NILDB_NODES || "").split(','),
};

export class NilDBBuilderService {

    builderKey: string;
    builderSigner: Signer;
    builderDid: Did | undefined;
    builderClient: any;

    constructor() {
        this.builderKey = config.BUILDER_KEY;
        this.builderSigner = Signer.fromPrivateKey(this.builderKey);
    }

    async initBuilder() {
        this.builderDid = await this.builderSigner.getDid();
        console.log('Builder DID:', this.builderDid.didString);

        this.builderClient = await SecretVaultBuilderClient.from({
            signer: this.builderSigner,
            dbs: config.NILDB_NODES,
            blindfold: { operation: "store" },
        });

        console.log('Builder client initialized');
    }

    // Helper to create invocations for a specific command
    private async getInvocations(command: Command): Promise<Record<string, string>> {
        const invocations: Record<string, string> = {};
        for (const node of this.builderClient.nodes) {
            invocations[node.id.didString] = await Builder.invocation()
                .subject(this.builderDid!)
                .audience(node.id)
                .command(command)
                .expiresIn(30_000)
                .signAndSerialize(this.builderSigner);
        }
        return invocations;
    }

    async createSurveyCollection(id: string, rawSchema: any, surveyOwnerDid: any) {
        try {
            const invocations = await this.getInvocations(NucCmd.nil.db.collections.create as Command);
            const result = await this.builderClient.createCollection(
                {
                    _id: id,
                    name: rawSchema.name,
                    type: rawSchema.type,
                    schema: rawSchema.schema,
                    owner: this.builderDid!.didString
                },
                { auth: { invocations } }
            );
            console.log("collection created", result);
            return id;
        } catch (e: any) {
            throw e;
        }
    }

    async submitResponseForUser(surveyId: string, userData: any) {
        const existingDocIds = await this.exists(surveyId, userData.signer);
        console.log("Existing", existingDocIds);

        if (existingDocIds && existingDocIds.length > 0) {
            const deleteInvocations = await this.getInvocations(NucCmd.nil.db.data.delete as Command);
            for (const id of existingDocIds) {
                const d = await this.builderClient.deleteData(
                    {
                        collection: surveyId,
                        filter: { _id: id },
                    },
                    { auth: { invocations: deleteInvocations } }
                );
                console.log("deleted", d);
            }
        }

        try {
            const invocations = await this.getInvocations(NucCmd.nil.db.data.create as Command);
            return await this.builderClient.createStandardData(
                {
                    collection: surveyId,
                    data: [userData]
                },
                { auth: { invocations } }
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
        console.log('builderSigner:', this.builderSigner ? 'present' : 'MISSING');
        console.log('collection', surveyId);

        const userDid = Did.parse(didString);
        console.log('issuing delegation to DID:', userDid);

        // SDK 3.0 style delegation
        const delegation = await Builder.delegation()
            .command(NucCmd.nil.db.data.create as Command)
            .subject(this.builderDid!)
            .audience(userDid)
            .expiresIn(3600_000) // 1 hour in ms
            .signAndSerialize(this.builderSigner);

        return delegation;
    }

    async getOwnerReadDelegation(surveyOwnerDid: Did, surveyId: string) {
        return await Builder.delegation()
            .audience(surveyOwnerDid)
            .subject(this.builderDid!)
            .command(NucCmd.nil.db.data.read as Command)
            .policy([
                ["==", ".args.collection", surveyId]
            ])
            .expiresIn(365 * 24 * 3600_000)
            .signAndSerialize(this.builderSigner);
    }

    async findSurveyResults(surveyId: string, groups: QuestionGroup[], signature: any) {
        await new Promise(r => setTimeout(r, 5000));

        try {
            const invocations = await this.getInvocations(NucCmd.nil.db.data.read as Command);
            const rawResults = await this.builderClient.findData(
                {
                    collection: surveyId,
                    filter: {}
                },
                { auth: { invocations } }
            );

            console.log(rawResults);

            try {
                const talliedResults = tallyResults(rawResults.data, groups);
                return talliedResults;
            } catch (error) {
                console.log("error tallying", error);
            }
        } catch (error) {
            console.log("error", JSON.stringify(error));
            return { result: false };
        }
    }

    async exists(surveyId: string, signer: string) {
        const invocations = await this.getInvocations(NucCmd.nil.db.data.read as Command);
        const rawResults = await this.builderClient.findData(
            {
                collection: surveyId,
                filter: { signer: signer }
            },
            { auth: { invocations } }
        );

        return rawResults.data[0] ? rawResults.data.map((r: any) => r._id) : false;
    }

    async getResponseById(surveyId: string, docId: string) {
        const invocations = await this.getInvocations(NucCmd.nil.db.data.read as Command);
        const rawResults = await this.builderClient.findData(
            {
                collection: surveyId,
                filter: { _id: docId }
            },
            { auth: { invocations } }
        );

        return rawResults.data[0];
    }

    encryptToBuilder(data: any): string {
        const message = Buffer.from(JSON.stringify(data));
        const pubKeyBytes = (this.builderDid as any).publicKeyBytes;
        const pubKeyHex = Buffer.from(pubKeyBytes).toString('hex');
        const encrypted = encrypt(pubKeyHex, message);
        return Buffer.from(encrypted).toString('base64');
    }

    decryptFromBuilder(encryptedBase64: string): any {
        const encrypted = new Uint8Array(Buffer.from(encryptedBase64, 'base64'));
        const decrypted = decrypt(this.builderKey, encrypted);
        return JSON.parse(Buffer.from(decrypted).toString());
    }
}