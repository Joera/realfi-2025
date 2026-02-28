import './env.js';  // must be first
import express from 'express';
import cors from 'cors';
import { NilDBBuilderService } from './services/nildb.builder.service.js';
import { base } from 'viem/chains';

// import { NilAIService } from './nillai.service.js';

import { SurveyController } from './survey.ctrlr.js';
import { ViemService, LitService, IPFSMethods } from "@s3ntiment/shared";
import { Codec } from '@nillion/nuc';

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
await lit.init(); 

app.post('/api/create-survey', async (req, res) => {

  console.log(req.body)
  const surveyCid = await survey.create(req.body);
  console.log("b4", surveyCid)
  res.send( surveyCid );

});

app.post('/api/request-user-delegation', async (req, res) => {

  const { didString, surveyId, signature} = req.body;

    // check signature againt isParticipant

    const delegation =  await nildb.getUserWriteDelegation(didString, surveyId);

    res.json({ delegation });

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
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();