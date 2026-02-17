import { nagaTest } from "@lit-protocol/networks";
import { createLitClient, type LitClient } from "@lit-protocol/lit-client";
import { Account, privateKeyToAccount } from "viem/accounts";


async function main() {
    
    const litClient = await createLitClient({
        network: nagaTest,
      });
    
    const account: Account = privateKeyToAccount(
        `0x4101e21db7d3d8c711a159ff73a7db032435a74cb7ecca07f0d04756c4194df3` as `0x${string}`
    );
      
    const paymentManager = await litClient.getPaymentManager({
      account,
    });

    await paymentManager.deposit({ amountInLitkey: "10" });

}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(0);
  });
