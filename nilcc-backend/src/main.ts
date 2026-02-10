import express from 'express';
import cors from 'cors';
import { NilDBService } from './nildb.service.js';
import { Codec, Did, Signer } from '@nillion/nuc';

import { createSurveyCollectionSchema } from './create_collection.js';

import dotenv from 'dotenv';
import { LitService } from './lit.service.js';
// import { NilAIService } from './nillai.service.js';

// import { secp256k1 } from '@noble/curves/secp256k1.js';
// import { bytesToHex } from '@noble/hashes/utils.js';
// import { fromPinata } from './ipfs.factory.js';
import { PinataService } from './pinata.service.js';
// import { accsForSurveyOwner, accsForUser } from './accs.js';
import { SurveyController } from './survey.ctrlr.js';
import { ViemService } from './viem.service.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PINATA_KEY = process.env.PINATA_KEY || "";
const PINATA_SECRET = process.env.PINATA_SECRET || "";

let viem = new ViemService();
let nildb: any;
let nilai: any;
let lit = new LitService();
let pinata = new PinataService(PINATA_KEY, PINATA_SECRET);
let survey: any;

// import * as nuc from '@nillion/nuc';
// console.log('NUC exports:', Object.keys(nuc));
// import * as secretvaults from '@nillion/secretvaults';
// console.log('Secretvaults exports:', Object.keys(secretvaults));

await lit.init(); 

app.post('/api/create-survey', async (req, res) => {

  console.log(req.body)
  const surveyCid = survey.create(req.body);
  res.send({ surveyCid });

});

app.post('/api/request-delegation', async (req, res) => {


    const delegation = survey.requestDelegation(req.body)

    // 1. Fetch survey from contract
    // const survey = await surveyContract.getSurvey(collectionId);
    

    // 4. Return serialized delegation
    res.json({
        delegation: Codec.serializeBase64Url(delegation),
        expiresAt: Date.now() + (30 * 24 * 3600 * 1000)
    });
});


// Get survey results by surveyId // usinng general nil did as in demo 
// app.get('/api/survey-results/:surveyId', async (req, res) => {
//   try {
//     const { surveyId } = req.params;

//     // Create and run queries on encrypted data
//     let response  = await nildb.tabulateSurveyResults(surveyId)
//     // let summary = await nilai.ask("can you summarize: " + JSON.stringify(response))
//     res.send({
//       results: response,
//     //  ai_summary: summary
//     })


//   } catch (error: any) {
//     console.log(error)
//   }
// });

// Get survey results by surveyId
// app.post('/api/survey-results', async (req, res) => {
//   try {
//     const sessionSig = req.body.sessionSig;
//     const surveyId = req.body.surveyName;
//     const ownerAddress = req.body.ownerAddress;

//     // get ownerAddress from sessionSig ? 

//     // 1. Haal survey data op van contract
//     const survey = await getSurvey(ownerAddress, surveyId);
    
//     // 2. Decrypt Nillion key via Lit (met authSig)
//     const nilKey = await lit.decrypt(surveyId, survey.encryptedNilKey, sessionSig);
    
//     // 3. Maak nilDB instantie met die key
//     const keypair = Keypair.from(nilKey);
//     // const surveyNildb = new NilDBService(keypair);
//     // await surveyNildb.initOWner();
    
//     // 4. Query results
//     const response = await nildb.tabulateSurveyResults(surveyId, keypair);
    
//     res.send({ results: response });

//   } catch (error: any) {
//     console.log(error);
//     res.status(500).send({ error: error.message });
//   }
// });




// Generate delegate token for a user
// app.post('/api/delegate-token', async (req, res) => {

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

// app.post('/api/collection', async (req, res) => {

//     const uid = randomUUID();
//     console.log(uid);
//     const collection = surveyResultsCollection(uid);
//     const token = await nildb.createCollection(collection);
//     res.send(JSON.stringify(uid));
// });





// ====== SERVER STARTUP ======

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    
    nildb = new NilDBService();
    // nilai = new NilAIService();
    await nildb.initBuilder();

    survey = new SurveyController(nildb, lit, pinata, viem);
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();