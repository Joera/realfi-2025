import { LitContracts } from "@lit-protocol/contracts-sdk";

export const mintCapacityToken = async (yellowStoneWallet: any, litNodeClient: any, SELECTED_LIT_NETWORK: any) : Promise<string> => {

 
    const litContracts = new LitContracts({
        signer: yellowStoneWallet,
        network: SELECTED_LIT_NETWORK,
    });
    await litContracts.connect();

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

  console.log(capacityTokenId);

    const { capacityDelegationAuthSig } =
      await litNodeClient.createCapacityDelegationAuthSig({
        dAppOwnerWallet: ethersWallet,
        capacityTokenId,
        delegateeAddresses: [ethersWallet.address],
        uses: "1",
      });

    return capacityDelegationAuthSig
}