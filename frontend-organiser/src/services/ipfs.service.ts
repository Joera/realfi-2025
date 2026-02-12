export class IPFSMethods {

    private kuboGateway: string
    private pinataJWT: string;
    private pinataGateway: string;

    constructor(
        kuboGateway: string, pinataJWT: string, pinataGateway: string
    ) {
        this.kuboGateway = kuboGateway;
        this.pinataJWT = pinataJWT;
        this.pinataGateway = pinataGateway
    }

    async fetchFromKubo (cid: string): Promise<any> {
        
        const url = `https://${this.fixEndpoint(this.kuboGateway)}/api/v0/cat?arg=${cid}`;
 
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer YOUR_TOKEN'
            }
        });

        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('IPFS error response:', errorText);
            throw new Error(`Failed to fetch from IPFS: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error('Failed to parse IPFS response as JSON:', text);
            throw new Error('Invalid JSON response from IPFS');
        }
    }

    async addToKubo (fileContent: string, name: string, onlyHash?: boolean): Promise<string> {
        
        const formData = new FormData();
        const blob = new Blob([fileContent], { type: 'text/plain' });
        formData.append('file', blob, name);

        const apiPath = onlyHash ? "api/v0/add?only-hash=true" : "api/v0/add";

        const response = await fetch(
            `https://${this.fixEndpoint(this.kuboGateway)}/${apiPath}`,
            {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - browser will set it automatically with correct boundary
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`IPFS add failed: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const result: any = await response.json();
        return result.Hash || result.Cid?.['/'] || result.Cid;
    };

    async dagPut ( fileContent: string, name: string): Promise<string> {
        
        const formData = new FormData();
        const blob = new Blob([fileContent], { type: 'application/json' });
        formData.append('object data', blob, name || 'dag.json');

        const response = await fetch(
            `https://${this.fixEndpoint(this.kuboGateway)}/api/v0/dag/put`,
            {
            method: 'POST',
            body: formData,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DAG put failed: ${response.status} ${response.statusText}\n${errorText}`);
        }

        const result: any = await response.json();
        return result.Cid['/'] || result.Cid || result.Hash;
    };

    async uploadToPinata(content: string | Blob, filename: string): Promise<string> {

        const formData = new FormData();
        
        if (typeof content === 'string') {
        formData.append('file', new Blob([content]), filename);
        } else {
        formData.append('file', content, filename);
        }

        const response = await fetch(`https://api.pinata.cloud/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${this.pinataJWT}`
        },
        body: formData
        });

        if (!response.ok) {
        throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const data: any = await response.json();
        return data.IpfsHash;
    }

    async fetchFromPinata(cid: string) : Promise<any> {

        let res = await fetch(import.meta.env.VITE_PINATA_GATEWAY + "/ipfs/" + cid);

        return res.text()
    }

    fixEndpoint (endpoint: string) {
        return endpoint
            .replace(/^(https?:\/\/)/, "") // Remove protocol if present
            .replace(/\/+$/, ""); // Remove trailing slashes
    };


}