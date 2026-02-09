import express from 'express';
import cors from 'cors';
import { NilDBService } from './nildb.service.js';
import { Did, Signer } from '@nillion/nuc';

import { createSurveyCollectionSchema } from './create_collection.js';

import dotenv from 'dotenv';
import { LitService } from './lit.service.js';
// import { NilAIService } from './nillai.service.js';

import { secp256k1 } from '@noble/curves/secp256k1.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { fromPinata } from './ipfs.factory.js';
import { PinataService } from './pinata.service.js';
import { accsForSurveyOwner, accsForUser } from './accs.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PINATA_KEY = process.env.PINATA_KEY || "";
const PINATA_SECRET = process.env.PINATA_SECRET || "";

let nildb: any;
let nilai: any;
let lit = new LitService();
let pinata = new PinataService(PINATA_KEY, PINATA_SECRET);

// import * as nuc from '@nillion/nuc';
// console.log('NUC exports:', Object.keys(nuc));
// import * as secretvaults from '@nillion/secretvaults';
// console.log('Secretvaults exports:', Object.keys(secretvaults));

await lit.init(); 

app.post('/api/create-survey', async (req, res) => {

  console.log(req.body)

    const authContext = req.body.authContext;
    const signerAddress = req.body.signerAddress;
    const surveyId = req.body.surveyId;
    const surveyConfig = req.body.surveyConfig;

    console.log("signer", signerAddress)
    console.log("authContext", authContext)

    const privateKeyBytes = secp256k1.utils.randomSecretKey();
    const privateKeyHex = bytesToHex(privateKeyBytes);
    const surveyOwner = Signer.fromPrivateKey(privateKeyHex, 'key');
    const surveyOwnerDid = await surveyOwner.getDid();

    const encryptedSurveyConfig = await lit.encrypt(
      surveyConfig, 
      accsForUser()
    );

    // Builder delegeert collection creation aan owner
    // const delegation = nildb.delegateCollectionCreation(surveyOwnerDid);
    // const ownerClient = await nildb.createSurveyOwner(surveyOwner);

    const encryptedKey = await lit.encrypt(
      privateKeyHex, 
      accsForSurveyOwner(surveyId) 
    );

    const schema = createSurveyCollectionSchema(surveyId, surveyConfig)
    await nildb.createSurveyCollection(schema)

    const config = {

      nilDid: surveyOwnerDid,
      encryptedNilKey: encryptedKey,
      collectioniD: schema._id,
      surveyConfig: encryptedSurveyConfig

    }

    const surveyCid = (await pinata.uploadJSON(config)).IpfsHash;

    res.send({
       surveyCid
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
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();