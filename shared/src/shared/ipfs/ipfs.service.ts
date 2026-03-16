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

    isCID (value: string): boolean {
        if (!value || typeof value !== 'string') return false
        // CIDv0: base58, starts with 'Qm', 46 chars
        if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(value)) return true
        // CIDv1: starts with 'b' (base32), typically 59+ chars
        if (/^b[a-z2-7]{58,}$/.test(value)) return true
        return false
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

        // console.log("PINATA UPLOAD B4", content)

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

        console.log("PINATA UPLOAD", response)

        if (!response.ok) {
            throw new Error(`Pinata upload failed: ${response.statusText}`);
        }

        const data: any = await response.json();

        console.log("AFTER UPLOAD", data)
        
        return data.IpfsHash;
    }

    async fetchFromPinata(cid: string) : Promise<any> {

        if (this.isCID(cid)) {

            try {

                const url = this.pinataGateway + "/ipfs/" + cid;
                let res = await fetch(url);
                return res.text()

            } catch (e) {

                console.log(e);
            }
        } else {
            console.log("your requesting an invalid cid");
        }
    }

    fixEndpoint (endpoint: string) {
        return endpoint
            .replace(/^(https?:\/\/)/, "") // Remove protocol if present
            .replace(/\/+$/, ""); // Remove trailing slashes
    };


}