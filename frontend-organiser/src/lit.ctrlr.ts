import { LitActionResource, LitPKPResource, createSiweMessage, generateAuthSig } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { ethers, Wallet } from "ethers"; 
import { delegateCapacityToken, mintCapacityToken } from "./capacity.js";

export const createSessionSignatures = async (capacityTokenId?: string) => {

    const _LITNETWORK = LIT_NETWORK.Datil;

    const client = new LitNodeClient({
        litNetwork: _LITNETWORK,
        debug: true 
    });

    // const litProvider = new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    console.log("address",address)

    if (capacityTokenId == undefined) {
        capacityTokenId = await mintCapacityToken(signer, client, _LITNETWORK);
    }

    const capacityDelegationAuthSig = await delegateCapacityToken(signer, client, capacityTokenId)

    const resourceAbilityRequests : any = [
        {
            resource: new LitPKPResource("*"),
            ability: LIT_ABILITY.PKPSigning,
          },
        //   {
        //     resource: new LitActionResource("*"),
        //     ability: LIT_ABILITY.LitActionExecution,
        //   },
    ];

    const sigs = await client.getSessionSigs({
        chain: "ethereum",
        capabilityAuthSigs: [capacityDelegationAuthSig],
        expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 10 minutes
        resourceAbilityRequests,
        authNeededCallback: async ({
            uri,
            expiration,
            resourceAbilityRequests,
        }) => {
            const toSign = await createSiweMessage({
                uri,
                expiration,
                resources: resourceAbilityRequests,
                walletAddress: await signer.getAddress(),
                nonce: await client.getLatestBlockhash(),
                litNodeClient: client,
            });
            
            return await generateAuthSig({
                signer: signer,
                toSign,
            });
        },
    });

    return {
        
        sessionSig: sigs,
        signerAddress: signer.getAddress()
    }
}