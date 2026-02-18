
import { nagaTest } from "@lit-protocol/networks";
import { createLitClient, type LitClient } from "@lit-protocol/lit-client";
import { Account, privateKeyToAccount } from "viem/accounts";
import dotenv from "dotenv";
import { getAddress } from "viem";
import { createPaymentDelegationAuthSig } from '@lit-protocol/auth-helpers';

// Load environment variables
dotenv.config();


async function main() {

    console.log(process.argv)

    const userAddr = getAddress(process.argv[2]); 

    console.log("user", userAddr)
    
    const litClient = await createLitClient({
        network: nagaTest,
      });
    
    const sponsorAccount: Account = privateKeyToAccount(
        `0x${process.env.PRIVATE_KEY}` as `0x${string}`
    );
      

    // Call this from an API endpoint, passing the user's address
    const paymentDelegationAuthSig = await createPaymentDelegationAuthSig({
        signer: sponsorAccount,          // your funded viem account
        signerAddress: sponsorAccount.address,
        delegateeAddresses: [userAddr], // the user's EOA
        maxPrice: '1000000000000000000',
        scopes: ['encryption_sign', 'sign_session_key','lit_action'],
        litClient,
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });

    console.log(paymentDelegationAuthSig);

}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(0);
  });

