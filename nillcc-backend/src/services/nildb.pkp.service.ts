import { createNillionInvocationAction } from "@s3ntiment/shared";

// Backend service that uses PKP-signed invocations
export class NillionPkpClient {

    lit: any;

    constructor(lit: any) {
        this.lit = lit
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
                createNillionInvocationAction,
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
        
        for (const node of this.nodes) {
            
            const result = await this.lit.executeAction(
                'create-invocation',
                createNillionInvocationAction,
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
            
            const text = await response.text();
            console.log('Create collection response:', response.status, text);

            // Handle empty response
            const data = text ? JSON.parse(text) : { status: response.status };
            results[node.did] = { status: response.status, data };
        }
        
        return results;
    }

    async testNodeEndpoints() {
        for (const node of this.nodes) {
            // Check /about
            const aboutRes = await fetch(`${node.url}/about`);
            console.log(`${node.url}/about:`, aboutRes.status, await aboutRes.text());
            
            // Check various paths
            const paths = [
                '/v1/builders',
                '/v1/collections', 
                '/v1/data',
                '/api/v1/builders',
                '/api/v1/collections'
            ];
            
            for (const path of paths) {
                const res = await fetch(`${node.url}${path}`, { method: 'OPTIONS' });
                console.log(`${node.url}${path}:`, res.status);
            }
        }
    }
}