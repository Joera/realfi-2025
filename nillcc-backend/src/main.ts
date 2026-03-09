import './env.js';  // must be first
import express from 'express';
import cors from 'cors';
import { NilDBBuilderService } from './services/nildb.builder.service.js';
import { createPaymentDelegationAuthSig } from '@lit-protocol/auth-helpers';
import { base } from 'viem/chains';

// import { NilAIService } from './nillai.service.js';

import { SurveyController } from './survey.ctrlr.js';
import { ViemService, LitService, IPFSMethods } from "@s3ntiment/shared";
import { Codec } from '@nillion/nuc';
import { Account, verifyMessage } from 'viem';
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' with { type: 'json' }
import { privateKeyToAccount } from 'viem/accounts';

const app = express();
app.use(cors());
app.use(express.json());

const PINATA_KEY = process.env.VITE_PINATA_KEY || "";
const PINATA_SECRET = process.env.VITE_PINATA_SECRET || "";
const PINATA_JWT = process.env.VITE_PINATA_JWT || "";
const PINATA_GATEWAY = process.env.VITE_PINATA_GATEWAY || "";
const KUBO_ENDPOINT = process.env.VITE_KUBO_ENDPOINT || "";
const ALCHEMY_KEY = process.env.VITE_ALCHEMY_KEY || "";
const LIT_NETWORK = process.env.VITE_LIT_NETWORK || "";

const viem = new ViemService(base, ALCHEMY_KEY);
const nildb = new NilDBBuilderService();
// const nilai: any;
const lit = new LitService(LIT_NETWORK);
const ipfs = new IPFSMethods(KUBO_ENDPOINT,PINATA_JWT, PINATA_GATEWAY);
const survey = new SurveyController(nildb, lit, ipfs, viem);
await nildb.initBuilder();
const litClient = await lit.init(); 

app.post('/api/create-survey', async (req, res) => {

  const surveyCid = await survey.create(req.body);
  res.send( surveyCid );

});

app.post('/api/request-user-delegation', async (req, res) => {

  const { didString, surveyId, signature} = req.body;

    // check signature againt isParticipant

    const delegation =  await nildb.getUserWriteDelegation(didString, surveyId);

    res.json({ delegation });

});

app.post('/api/submit-survey', async (req, res) => {

  const { surveyId, userData, signature, signer, smc } = req.body;

  const isValidSignature = await verifyMessage({
      message: `s3ntiment:submit:${surveyId}`,
      signature,
      address: signer
  });

  const isParticipant = await viem.read(
      surveyStore.address as `0x${string}`,
      surveyStore.abi,
      'isParticipant',
      [surveyId, smc]
  );

  const ownerAbi = [{
      inputs: [],
      name: "owner",
      outputs: [{ name: "", type: "address" }],
      stateMutability: "view",
      type: "function"
  }];

  const owner = await viem.read(smc, ownerAbi, 'owner', []);
  const isSigner = owner.toLowerCase() === signer.toLowerCase();

  if (isValidSignature && isParticipant && isSigner) {

    console.log(0);

    try {
        const result = await nildb.submitResponseForUser(surveyId, userData);
    } catch (error) {
        console.log("ERROR",error);
    }

      res.json({ success: true });
  } else {
      console.log("failed:", { isValidSignature, isParticipant, isSigner });
      res.json({ success: false });
  }
});
  



// Get survey results by surveyId // usinng general nil did as in demo 
app.post('/api/survey-results', async (req, res) => {

  try {
    const { surveyId, groups } = req.body;

    const signature = "";
    // Create and run queries on encrypted data
    let response  = await nildb.findSurveyResults(surveyId, groups, signature)
    // let summary = await nilai.ask("can you summarize: " + JSON.stringify(response))
    res.send({
      results: response,
    //  ai_summary: summary
    })


  } catch (error: any) {
    console.log(error)
  }
});

app.post('/api/lit-payment-delegation', async (req, res) => {

  console.log("request payment delegation")
  try {

    const { userAddr, signature } = req.body;

    console.log("userAddress", userAddr)

    // check signature
    const hasValidSignature = await viem.publicClient.verifyMessage({
      address: userAddr,
      message: 'Request capability to decrypt',
      signature
    });

    // isSignerForOwnerOrParticipant
    // const isOwner = viem.read()
    // const iParticipant = viem.read() 

    if (hasValidSignature) {
    
      const sponsorAccount: Account = privateKeyToAccount(
          `0x${process.env.VITE_LIT_PAYMASTER_KEY}` as `0x${string}`
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

      res.status(200).json({
        payload: paymentDelegationAuthSig
      });

    } else { 

      res.status(401).json({
        msg: 'unauthorized'
      });
    }


  } catch (error: any) {
    console.log(error)
  }
});



// ====== SERVER STARTUP ======

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();