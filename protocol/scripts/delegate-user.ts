import { nagaTest } from "@lit-protocol/networks";
import { createLitClient, type LitClient } from "@lit-protocol/lit-client";
import { Account, privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import { getAddress } from "viem";

// Load environment variables
dotenv.config();


async function main() {

  console.log(process.env.PRIVATE_KEY)

    const userAddr = getAddress(process.argv[2]); 
    
    const litClient = await createLitClient({
        network: nagaTest,
      });
    
    const account: Account = privateKeyToAccount(
        `0x${process.env.PRIVATE_KEY}` as `0x${string}`
    );
      
    const paymentManager = await litClient.getPaymentManager({
      account,
    });

    // await paymentManager.setRestriction({
    //     totalMaxPrice: '1000000000000000000', // max wei per request
    //     requestsPerPeriod: '100',
    //     periodSeconds: '3600',
    // });

    let res = await paymentManager.delegatePaymentsBatch({
        userAddresses: [userAddr],
    });

    console.log(res)

    const balance = await paymentManager.getBalance({
        userAddress: userAddr,
    });

    const payerBalance = await paymentManager.getBalance({
        userAddress: account.address,
    });
    console.log('Payer balance:', payerBalance);


    console.log(userAddr, balance)
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(0);
  });
