import { ownerInvocationAction, userDelegationAction } from "@s3ntiment/shared";

// Backend service that uses PKP-signed invocations
export class NillionPkpClient {

    lit: any;
    poolId: string;
    safeAddress: string;
    contract: string;

    constructor(lit: any, poolId: string, safeAddress: string, contract: string) {
        this.lit = lit;
        this.poolId = poolId;
        this.safeAddress = safeAddress;
        this.contract = contract;
    }

    private nodes = [
        { url: 'https://nildb-stg-n1.nillion.network', did: 'did:key:zQ3shcivRHjnU2ASFFTFC3Y1uoLAqEhTTqMKHGUundhcywNy7' },
        { url: 'https://nildb-stg-n2.nillion.network', did: 'did:key:zQ3shTJe9zjBPfhcykspLMjLpCwcBHqowGcpmvuY3tiR3jvHD' },
        { url: 'https://nildb-stg-n3.nillion.network', did: 'did:key:zQ3sheuiqFDDhsiMcEdfHcGFbqbfAA1ttqDsSaLaUTk9LQfpe' },
    ];

    async registerAsBuilder(pkpId: string, pkpDid: string, usageKey: string, name: string = 'S3ntiment PKP') {
        const results: Record<string, any> = {};
        
        for (const node of this.nodes) {
            const result  = await this.lit.executeAction(
                'nillion-invocation',
                ownerInvocationAction(this.poolId, this.contract, this.safeAddress),
                { 
                    pkpId, 
                    pkpDid, 
                    nodeDid: node.did, 
                    command: '/nil/db/builders/create'
                },
                usageKey
            );

            let { invocation } = result.response;

            const response = await fetch(`${node.url}/v1/builders/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${invocation}`
                },
                body: JSON.stringify({ did: pkpDid, name }) 
            });
            
            results[node.did] = response.status;
        }
        
        return results;
    }

    // In NillionPkpClient.createCollection, add better error handling:
    async createCollection(pkpId: string, pkpDid: string, usageKey: string, collectionData: any) {
        const results: Record<string, any> = {};

        console.log('Creating collection with data:', JSON.stringify(collectionData, null, 2));

        
        for (const node of this.nodes) {
            
            const result = await this.lit.executeAction(
                'create-invocation',
                ownerInvocationAction(this.poolId, this.contract, this.safeAddress),
                { pkpId, pkpDid, nodeDid: node.did, command: '/nil/db/collections/create' },
                usageKey
            );

            const invocation = result?.invocation || result?.response?.invocation;
            
            const response = await fetch(`${node.url}/v1/collections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${invocation}`
                },
                body: JSON.stringify(collectionData)
            });

            console.log("COLLECTION", response)
            
            const text = await response.text();
            console.log('Create collection response:', response.status, text);

            // Handle empty response
            const data = text ? JSON.parse(text) : { status: response.status };
            results[node.did] = { status: response.status, data };
        }
        
        return results;
    }

    async getCollection(pkpId: string, pkpDid: string, usageKey: string, collectionId: string) {
        const node = this.nodes[0];
        
        const result = await this.lit.executeAction(
            'get-collection',
            ownerInvocationAction(this.poolId, this.contract, this.safeAddress),
            { pkpId, pkpDid, nodeDid: node.did, command: '/nil/db/collections/read' },
            usageKey
        );
        
        const invocation = result?.response?.invocation;  
        
        const response = await fetch(`${node.url}/v1/collections/${collectionId}`, {
            headers: { 'Authorization': `Bearer ${invocation}` }
        });
        
        console.log(`Collection ${collectionId} exists?`, response.status);
        const data = response.ok ? await response.json() : null;
        return { status: response.status, data };
    }

    async listCollections(pkpId: string, pkpDid: string, usageKey: string) {
        const node = this.nodes[0];
        
        const result = await this.lit.executeAction(
            'list-collections',
            ownerInvocationAction(this.poolId, this.contract, this.safeAddress),
            { pkpId, pkpDid, nodeDid: node.did, command: '/nil/db/collections/read' },
            usageKey
        );
        
        const invocation = result?.response?.invocation;
        
        const response = await fetch(`${node.url}/v1/collections`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${invocation}`
            }
        });
        
        const data = await response.json();
        console.log('Collections for this builder:', JSON.stringify(data, null, 2));
        return data;
    }

    /**
     * Generate a delegation token for user data writes.
     * 
     * This creates a SINGLE delegation (not per-node tokens).
     * The SDK will use this delegation to build per-node invocations.
     * 
     * Token structure (delegation):
     * - iss/sub: PKP DID (builder granting permission)
     * - aud: User DID (receiving permission)
     * - cmd: '/nil/db/data/create'
     * - pol: [] (policy - empty means no restrictions)
     * 
     * Frontend usage:
     *   await sdk.createData(body, { auth: { delegation } })
     * 
     * NOT:
     *   await sdk.createData(body, { auth: { invocations: {...} } })
     */
    async getUserWriteDelegation(surveyId: string, userDid: string, poolId: string, usageKey: string, pkpId: string, pkpDid: string) {

        const params = {
            pkpId,
            pkpDid,
            userDid,
            collectionId: surveyId
        };

        const result = await this.lit.executeAction(
            poolId,
            userDelegationAction(this.poolId, this.contract),
            params,
            usageKey
        );
        
        return { delegation: result.response.delegation };
    }
}