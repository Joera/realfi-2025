import initMishtiwasm, { msg_to_point, request_from_signer } from '@holonym-foundation/mishtiwasm';
import { keccak256, toBytes } from 'viem';


export class OPRFService {

    signerUrl: string;

    constructor(signerUrl: string) {

        this.signerUrl = signerUrl
    }

    async init() {

        // console.log(import.meta.env.VITE_PROD)

        // const wasmUrl = import.meta.env.VITE_PROD == 'true'
        //     ? new URL('/assets/mishtiwasm_bg.wasm', import.meta.url)
        //     : new URL('node_modules/@holonym-foundation/mishtiwasm/pkg/esm/mishtiwasm_bg.wasm', import.meta.url);

        // console.log(wasmUrl)

        const m = await initMishtiwasm(new URL('/mishtiwasm_bg.wasm', import.meta.url));
    }

    async getSecp256k1(inputData: string): Promise<`0x${string}`> {
        console.log(inputData)
        const hashed = keccak256(toBytes(inputData)); // 32 bytes → 64 hex chars
        console.log(hashed);
        const messageBytes = toBytes(hashed).slice(0, 24);
        const point = msg_to_point(messageBytes);
        const key = await request_from_signer(point, "OPRFSecp256k1", this.signerUrl);
        const keyHex = BigInt(key).toString(16).padStart(64, '0');
        return `0x${keyHex}`;
    }

    async getBabyJubJub(inputData: string) {

        request_from_signer(inputData, "OPRFBabyJubJub", this.signerUrl)
            .then( (result: any) => {
                console.log(`Request succeeded:`, result);
                return result;
            })
            .catch( (err: any) => {
                console.error(`Request failed:`, err);
            })
            .finally(() => {
                console.log("Request completed");
            });

    }

    






}