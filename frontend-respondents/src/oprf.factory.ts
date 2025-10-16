import initMishtiwasm, { request_from_signer } from "@holonym-foundation/mishtiwasm"

export const createKey = async (input: string) : Promise<string> => {

    await initMishtiwasm('/mishtiwasm_bg.wasm');

    return new Promise( (resolve, reject) => {

             request_from_signer(input, "OPRFSecp256k1", "https://oprf.transport-union.dev")
            .then(result => {
                console.log(`Request succeeded:`, result);
                resolve(result)
            })
            .catch(err => {
                console.error(`Request failed:`, err);
                reject(err)
            })
            .finally(() => {
                console.log("Request completed");
            });
    })
}