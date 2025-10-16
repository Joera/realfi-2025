import { createWalletClient, http, createPublicClient, keccak256, toHex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import dotenv from 'dotenv'
import crypto from 'crypto'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'

const baseUrl = "https://s3ntiment.composible.io"

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

async function generateQRCodeSVG(cardData: CardData, outputDir: string = './qr-codes', surveyId: string): Promise<string> {
  const { nullifier, batchId, signature } = cardData
  
  // Secure URL - only nullifier and batch in QR
  const qrUrl = `${baseUrl}?n=${nullifier}&b=${batchId}&sig=${signature}&s=${surveyId}`;
  console.log(qrUrl);

  // Generate filename
  const filename = `${batchId}_${nullifier}.svg`
  const filepath = path.join(outputDir, filename)
  
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true })
    
    // Generate SVG QR code
    const svgString = await QRCode.toString(qrUrl, {
      type: 'svg',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
    
    // Save to file
    await fs.writeFile(filepath, svgString)
    
    console.log(`QR code saved: ${filepath}`)
    return filepath
  } catch (error) {
    console.error(`Error generating QR code for ${nullifier}:`, error)
    throw error
  }
}

const generateCardSecrets = async (batchId: string, batchSize: number, surveyId: string) => {
  const cards: any[] = [];
  
  for (let i = 0; i < batchSize; i++) {

    const nullifier = generateRandomNullifier()
    const message = `${nullifier}|${batchId}`
    
    // Hash the message first, then sign the hash
    const messageHash = keccak256(toHex(message))
    
    // Sign the hash with EIP-191 prefix
    const signature = await walletClient.signMessage({
      message: { raw: messageHash }
    })
    
    const card: any = {
      nullifier,
      batchId: batchId,
      signature: signature,
    };
  
    await generateQRCodeSVG(card, './output/mina', surveyId)
    cards.push(card)
  }
  
  return cards;
}

const batch_size = 6;
const batch_id = "debug";
const surveyId = "0x934E20411C9E8E92946BD8786D7c3E5bC4DB1387-mina_v2"

generateCardSecrets(batch_id, batch_size, surveyId)