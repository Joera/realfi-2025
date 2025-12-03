import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
// import Did from '@nillion/client-web';
import { NilDBService } from './nildb.service.js';
import { Did, Keypair } from '@nillion/nuc';

import { surveyResultsCollection } from './create_collection.js';

import dotenv from 'dotenv';
// import { NilAIService } from './nillai.service.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Store collection IDs (in production, use a real database)
const collections = new Map();

let nildb: any;
let nilai: any;

app.post('/api/create-survey', async (req, res) => {

  console.log(req.body)

    const litSessionSig = req.body.sessionSig;
    const signerAddress = req.body.signerAddress;
    const surveySlug = req.body.surveyName
    const surveyCid = req.body.surveyCid;

    console.log("signer", signerAddress)
    console.log("session", litSessionSig)
                    
    // generate new NIL DID 
    const keypair = Keypair.generate();
    const did = keypair.toDid().toString();
    console.log('New DID:', did);
    

    // encrypt NIL DID private key with LIT UCL: only address that registered survey can access
    console.log('Private Key:', keypair.privateKey().toString());

    /// we do not decrypt with lit key .. we decrypt the nill private key with lit 

    // so who can do so? 

    // register survey on contract with name, cid, did + cipher 

    res.send({
      signer: signerAddress
    })


});

// Get survey results by surveyId // usinng general nil did as in demo 
app.get('/api/survey-results/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Create and run queries on encrypted data
    let response  = await nildb.tabulateSurveyResults(surveyId)
    let summary = await nilai.ask("can you summarize: " + JSON.stringify(response))
    res.send({
      results: response,
      ai_summary: summary
    })


  } catch (error: any) {
    console.log(error)
  }
});

// Get survey results by surveyId
app.post('/api/survey-results', async (req, res) => {
  try {

    const authSig = req.body.sessionSig;
    const surveyId = req.body.surveyId;

    // retrieve address from sessionSig created in frontend

    // retrieve surveyInfo from contract

    // decrypt key using authSig .. qualifies when address has registered the survey 

    // initiate nil did and nildb builder

    // Create and run queries on encrypted data
    let response  = await nildb.tabulateSurveyResults(surveyId)
    // let summary = await nilai.ask("can you summarize: " + JSON.stringify(response))
    res.send({
      results: response,
      // ai_summary: summary
    })


  } catch (error: any) {
    console.log(error)
  }
});





// Generate delegate token for a user
app.post('/api/delegate-token', async (req, res) => {

    // check with smart contract? 
    // signature + nullifier 

    console.log(req.body)
  
    const didString = req.body.did;
    const publicKeyHex = didString.replace('did:nil:', '');
    const did = Did.fromHex(publicKeyHex);
    const token = nildb.delegateToken(did);
    console.log(token);
    res.send(JSON.stringify(token));
});


// app.post('/api/create', async (req, res) => {

//     // check with smart contract? 
//     // signature + nullifier 

//     console.log(req.body)
  
//     const didString = req.body.did;
//     const publicKeyHex = didString.replace('did:nil:', '');
//     const did = Did.fromHex(publicKeyHex);
//     const token = nildb.delegateToken(did);
//     console.log(token);
//     res.send(JSON.stringify(token));
// });

app.post('/api/collection', async (req, res) => {

    const uid = randomUUID();
    console.log(uid);
    const collection = surveyResultsCollection(uid);
    const token = await nildb.createCollection(collection);
    res.send(JSON.stringify(uid));
});





// ====== SERVER STARTUP ======

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    
    nildb = new NilDBService();
    // nilai = new NilAIService();
    await nildb.init();
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();