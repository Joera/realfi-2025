export class PinataService {
    private apiKey: string
    private apiSecret: string
    private baseUrl = 'https://api.pinata.cloud'

    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey
        this.apiSecret = apiSecret
    }

    /**
     * Upload JSON config to Pinata IPFS
     * @param config Survey configuration object
     * @param filename Optional filename for the upload
     * @returns Promise with IPFS hash (CID) and other metadata
     */
    async uploadJSON(config: any, filename?: string): Promise<PinataUploadResponse> {
        const name = filename || `${config.title?.replace(/\s+/g, '_').toLowerCase() || 'survey'}_config.json`

        const data = JSON.stringify({
            pinataContent: config,
            pinataMetadata: {
                name: name
            },
            pinataOptions: {
                cidVersion: 1
            }
        })

        const response = await fetch(`${this.baseUrl}/pinning/pinJSONToIPFS`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pinata_api_key': this.apiKey,
                'pinata_secret_api_key': this.apiSecret
            },
            body: data
        })

        if (!response.ok) {
            const error : any = await response.json()
            throw new Error(error.error || `Upload failed with status ${response.status}`)
        }

        const result: any = await response.json()
        return result
    }

    /**
     * Upload a file to Pinata IPFS
     * @param file File or Blob to upload
     * @param filename Name for the file
     * @returns Promise with IPFS hash (CID) and other metadata
     */
    async uploadFile(file: File | Blob, filename: string): Promise<PinataUploadResponse> {
        const formData = new FormData()
        formData.append('file', file, filename)

        const metadata = JSON.stringify({
            name: filename
        })
        formData.append('pinataMetadata', metadata)

        const options = JSON.stringify({
            cidVersion: 1
        })
        formData.append('pinataOptions', options)

        const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
            method: 'POST',
            headers: {
                'pinata_api_key': this.apiKey,
                'pinata_secret_api_key': this.apiSecret
            },
            body: formData
        })

        if (!response.ok) {
            const error : any = await response.json()
            throw new Error(error.error || `Upload failed with status ${response.status}`)
        }

        const result: any = await response.json()
        return result
    }

    async get(cid: string) {

        const ipfsApiUrl = `${this.getGatewayUrl(cid)}`;
        const response = await fetch(ipfsApiUrl);
        if (!response.ok) {
            throw new Error(
            `IPFS retrieval failed: ${response.status} ${response.statusText}`,
            );
        }

        const result = await response.text();

        console.log(result)
        return result;
    }

    /**
     * Get the gateway URL for an IPFS hash
     * @param cid IPFS hash (CID)
     * @param useDedicatedGateway Use Pinata's dedicated gateway (requires setup)
     * @returns Full URL to access the content
     */
    getGatewayUrl(cid: string, useDedicatedGateway = false): string {
        if (useDedicatedGateway) {
            // Replace with your dedicated gateway domain
            return `https://gateway.pinata.cloud/ipfs/${cid}`
        }
        return `https://gateway.pinata.cloud/ipfs/${cid}`
    }

    /**
     * Unpin content from Pinata
     * @param cid IPFS hash to unpin
     */
    async unpin(cid: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/pinning/unpin/${cid}`, {
            method: 'DELETE',
            headers: {
                'pinata_api_key': this.apiKey,
                'pinata_secret_api_key': this.apiSecret
            }
        })

        if (!response.ok) {
            const error : any = await response.json()
            throw new Error(error.error || `Unpin failed with status ${response.status}`)
        }
    }

    /**
     * List all pinned content
     * @param options Optional filters for the listing
     * @returns List of pinned content
     */
    async listPinned(options?: ListPinnedOptions): Promise<PinataListResponse> {
        const params = new URLSearchParams()
        if (options?.status) params.append('status', options.status)
        if (options?.pageLimit) params.append('pageLimit', options.pageLimit.toString())
        if (options?.pageOffset) params.append('pageOffset', options.pageOffset.toString())

        const url = `${this.baseUrl}/data/pinList?${params.toString()}`
        
        const response = await fetch(url, {
            headers: {
                'pinata_api_key': this.apiKey,
                'pinata_secret_api_key': this.apiSecret
            }
        })

        if (!response.ok) {
            throw new Error(`List failed with status ${response.status}`)
        }

        const result: any = await response.json()
        return result
    }

    /**
     * Test authentication with Pinata
     * @returns Promise resolving to true if authenticated
     */
    async testAuthentication(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/data/testAuthentication`, {
                headers: {
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.apiSecret
                }
            })
            return response.ok
        } catch (error) {
            return false
        }
    }
}

// Type definitions
export interface PinataUploadResponse {
    IpfsHash: string
    PinSize: number
    Timestamp: string
    isDuplicate?: boolean
}

export interface ListPinnedOptions {
    status?: 'pinned' | 'unpinned' | 'all'
    pageLimit?: number
    pageOffset?: number
}

export interface PinataListResponse {
    count: number
    rows: Array<{
        id: string
        ipfs_pin_hash: string
        size: number
        user_id: string
        date_pinned: string
        date_unpinned: string | null
        metadata: {
            name: string
            keyvalues?: Record<string, any>
        }
    }>
}

// Example usage:
/*
const pinata = new PinataService('your_api_key', 'your_api_secret')

// Upload survey config
const config = { title: "My Survey", questions: [...] }
const result = await pinata.uploadJSON(config)
console.log('CID:', result.IpfsHash)
console.log('Gateway URL:', pinata.getGatewayUrl(result.IpfsHash))

// Upload a file
const file = new File(['content'], 'document.txt')
const fileResult = await pinata.uploadFile(file, 'document.txt')

// Test authentication
const isValid = await pinata.testAuthentication()
*/