import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
// import Did from '@nillion/client-web';
import { NillionService } from './nillion.service.js';
import { Did } from '@nillion/nuc';


const app = express();
app.use(cors());
app.use(express.json());

// Store collection IDs (in production, use a real database)
const collections = new Map();

let nillion: any;

// Generate delegate token for a user
app.post('/api/delegate-token', async (req, res) => {

    // check with smart contract? 
    // signature + nullifier 

    console.log(req.body)
  
    const didString = req.body.did;
    const publicKeyHex = didString.replace('did:nil:', '');
    const did = Did.fromHex(publicKeyHex);
    const token = nillion.delegateToken(did);
    console.log(token);
    res.send(JSON.stringify(token));
});


// Get survey results by surveyId
app.get('/api/survey-results/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;

    // Create and run queries on encrypted data
    let response  = await nillion.tabulateSurveyResults(surveyId)
    res.send(response)


  } catch (error: any) {
    console.log(error)
  }
});



// ====== SERVER STARTUP ======

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    
    nillion = new NillionService();
    await nillion.init()
    
    app.listen(PORT, () => {
        console.log("server running at " + PORT)
    } );
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();