import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { NilDBService } from './nildb.service.js';
import { Did, Keypair } from '@nillion/nuc';

import { surveyResultsCollection } from './create_collection.js';

import dotenv from 'dotenv';
import { LitService } from './lit.service.js';
import { getSurvey } from './contract.factory.js';
// import { NilAIService } from './nillai.service.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Store collection IDs (in production, use a real database)
const collections = new Map();

let nildb: any;
let nilai: any;
let lit = new LitService();

await lit.init(); 

app.post('/api/create-survey', async (req, res) => {

  console.log(req.body)

    const litSessionSig = req.body.sessionSig;
    const signerAddress = req.body.signerAddress;
    const surveySlug = req.body.surveyName
    const surveyCid = req.body.surveyCid;

    console.log("signer", signerAddress)
    console.log("session", litSessionSig)
                    
    const keypair = Keypair.generate();
    const did = keypair.toDid().toString();
    console.log('New DID:', did);
    console.log('Private Key:', keypair.privateKey().toString());

    const encryptedData = await lit.encrypt(keypair.privateKey().toString(), surveySlug);

    const collection = {}; 

    // create custom collection !!! so we can actually use blind compute

    //     Per survey een eigen collection → isolatie tussen surveys
    // Specifiek schema met %share velden → blind compute mogelijk
    // Survey owner als collection owner → jij (builder) hoeft geen read access
    // we willen toch een builder // die betaalt maar kan verder niks 

    res.send({
      nilDid: did,
      encryptedNilKey: encryptedData,
      collection: collection 
    })


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
app.post('/api/survey-results', async (req, res) => {
  try {
    const sessionSig = req.body.sessionSig;
    const surveyId = req.body.surveyName;
    const ownerAddress = req.body.ownerAddress;

    // get ownerAddress from sessionSig ? 

    // 1. Haal survey data op van contract
    const survey = await getSurvey(ownerAddress, surveyId);
    
    // 2. Decrypt Nillion key via Lit (met authSig)
    const nilKey = await lit.decrypt(surveyId, survey.encryptedNilKey, sessionSig);
    
    // 3. Maak nilDB instantie met die key
    const keypair = Keypair.from(nilKey);
    // const surveyNildb = new NilDBService(keypair);
    // await surveyNildb.initOWner();
    
    // 4. Query results
    const response = await nildb.tabulateSurveyResults(surveyId, keypair);
    
    res.send({ results: response });

  } catch (error: any) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});




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
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();