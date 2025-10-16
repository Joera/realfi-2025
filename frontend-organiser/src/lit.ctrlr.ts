import { LitActionResource, LitPKPResource, createSiweMessage, generateAuthSig } from "@lit-protocol/auth-helpers";
import { LIT_ABILITY } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import { ethers, Wallet } from "ethers"; 
import { delegateCapacityToken, mintCapacityToken } from "./capacity.js";

export const createSessionSignatures = async (capacityTokenId: string) => {


    const _LITNETWORK = LIT_NETWORK.DatilTest;

    const client = new LitNodeClient({
        litNetwork: _LITNETWORK,
        debug: true 
    });

    const litProvider = new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);
    const litSigner = new ethers.Wallet(
        import.meta.env.VITE_ETHEREUM_PRIVATE_KEY,
        new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    
    const mmProvider = new ethers.providers.Web3Provider(window.ethereum);
    await mmProvider.send("eth_requestAccounts", []);
    const mmSigner = mmProvider.getSigner();
    const address = await mmSigner.getAddress();
    console.log("address",address)

    const capacityDelegationAuthSig = await delegateCapacityToken(litSigner, client, capacityTokenId)

    const resourceAbilityRequests : any = [
        {
            resource: new LitPKPResource("*"),
            ability: LIT_ABILITY.PKPSigning,
          },
          {
            resource: new LitActionResource("*"),
            ability: LIT_ABILITY.LitActionExecution,
          },
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
                walletAddress: await mmSigner.getAddress(),
                nonce: await client.getLatestBlockhash(),
                litNodeClient: client,
            });
            
            return await generateAuthSig({
                signer: mmSigner,
                toSign,
            });
        },
    });

    return {
        
        sessionSig: sigs,
        signerAddress: address
    }
}