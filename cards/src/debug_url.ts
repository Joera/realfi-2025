import { createWalletClient, http, createPublicClient, keccak256, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import dotenv from 'dotenv'
import crypto from 'crypto'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'

const baseUrl =  "http://localhost:9999" // "https://s3ntiment.composible.io"; //

interface CardData {
  nullifier: string
  signature: string
  batchId: string
}

// Load environment variables
dotenv.config()

const pk = process.env.PRIVATE_KEY ? "0x" + process.env.PRIVATE_KEY as `0x${string}`: "0x"

// Create account from private key
const account = privateKeyToAccount(pk);

// Create wallet client
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http()
})

// Create public client for contract interactions
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

/**
 * Generate a random nullifier for card
 */
function generateRandomNullifier() {
  const randomBytes = crypto.randomBytes(16)
  return randomBytes.toString('base64url') // URL-safe base64
}


const generateCard = async (batchId: string) => {
    
    
    const cards: any[] = [];
    const nullifier = generateRandomNullifier()
    const message = `${nullifier}|${batchId}`
    
    // Hash the message first, then sign the hash
    const messageHash = keccak256(toHex(message))
    
    // Sign the hash with EIP-191 prefix
    const signature = await walletClient.signMessage({
      message: { raw: messageHash }
    })

    console.log(`${baseUrl}?n=${nullifier}&b=${batchId}&sig=${signature}`);

    return;
  

}

const batch_id = "debug";

generateCard(batch_id);