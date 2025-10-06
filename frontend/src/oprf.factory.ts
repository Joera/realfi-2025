import initMishtiwasm, { request_from_signer } from "@holonym-foundation/mishtiwasm"

export const createKey = async (input: string) : Promise<string> => {

    // const wasmPath = join(__dirname, '../node_modules/@holonym-foundation/mishtiwasm/pkg/esm/mishtiwasm_bg.wasm');
    // const wasmBuffer = await readFile(wasmPath);

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

// export const createNullifier = async () => {

//     const wasmPath = join(__dirname, '../node_modules/@holonym-foundation/mishtiwasm/pkg/esm/mishtiwasm_bg.wasm');
//     const wasmBuffer = await readFile(wasmPath);

//     await initMishtiwasm(wasmBuffer);

//     const lowEntropyData = {
//       email: "user@example.com",
//       username: "john_doe",
//       biometric: "fingerprint_hash_123"
//    };

//    // Hash the combined data first
//    const combined = JSON.stringify(lowEntropyData);
//    const preHash = createHash('sha256').update(combined).digest('hex');

//    // get nullifier 
//    request_from_signer(preHash, "OPRFBabyJubJub", "https://oprf.transport-union.dev")
//      .then(result => {
//         console.log(`Request succeeded:`, result);
//      })
//      .catch(err => {
//         console.error(`Request failed:`, err);
//      })
//      .finally(() => {
//         console.log("Request completed");
//      });


// }