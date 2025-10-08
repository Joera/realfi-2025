import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { NillionClient } from '@nillion/client-web';
import { NillionService } from './nillion.service';

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
  
    const user_did = req.body.did;
    const token = nillion.delegateToken(user_did);
    console.log(token);
    res.send(JSON.stringify(token));
});


// Get survey results by surveyId
app.get('/api/survey-results/:surveyId', async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { userId } = req.query;
  } catch (error: any) {
    console.log(error)
  }
});



// ====== SERVER STARTUP ======

const PORT = process.env.PORT || 3456;

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