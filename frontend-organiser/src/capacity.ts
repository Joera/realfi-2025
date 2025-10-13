import { LitContracts } from "@lit-protocol/contracts-sdk";

export const mintCapacityToken = async (ethersWallet: any, litNodeClient: any, SELECTED_LIT_NETWORK: any) : Promise<string> => {
    
    const litContracts = new LitContracts({
        signer: ethersWallet,
        network: SELECTED_LIT_NETWORK,
    });
    await litContracts.connect();

    console.log(SELECTED_LIT_NETWORK);
    console.log(ethersWallet)

    const capacityTokenId = (
        await litContracts.mintCapacityCreditsNFT({
        requestsPerKilosecond: 10,
        daysUntilUTCMidnightExpiration: 7,
        })
    ).capacityTokenIdStr;

    console.log("Capacity token ID:", capacityTokenId);

    return capacityTokenId

}


export const delegateCapacityToken = async (ethersWallet: any, litNodeClient: any, capacityTokenId: string) => {

    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });

    return capacityDelegationAuthSig
}