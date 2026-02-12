import { Signer } from '@nillion/nuc';

export class NillionService {

    signer: Signer

    constructor () {

        this.signer = Signer.fromPrivateKey(import.meta.env.VITE_ETHEREUM_PRIVATE_KEY.slice(2)); // Remove '0x' prefix
    }

    async getDid () {

        return await this.signer.getDid();
    }
}