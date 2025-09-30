import { createWalletClient, http, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import dotenv from 'dotenv'
import crypto from 'crypto'
import QRCode from 'qrcode'
import fs from 'fs/promises'
import path from 'path'

const baseUrl = "https://s3ntiment.composible.io" // "https://s3ntiment.eth.link"

interface CardData {
  secret: string
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
  chain: mainnet, // or your preferred chain
  transport: http()
})

// Create public client for contract interactions
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

/**
 * Generate a random secret for card
 */
function generateRandomSecret() {
  const randomBytes = crypto.randomBytes(16)
  return randomBytes.toString('base64url') // URL-safe base64
}

async function generateQRCodeSVG(cardData: CardData, outputDir: string = './qr-codes'): Promise<string> {
  const { secret, batchId, signature } = cardData
  
  // Secure URL - only secret and batch in QR
  const qrUrl = `${baseUrl}?s=${secret}&b=${batchId}&sig=${signature}`;
  console.log(qrUrl);

  // Generate filename
  const filename = `${batchId}_${secret}.svg`
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
    console.error(`Error generating QR code for ${secret}:`, error)
    throw error
  }
}

const generateCardSecrets = async (batchId: string, batchSize: number) => {
  const cards: any[] = [];
  
  for (let i = 0; i < batchSize; i++) {

    const secret = generateRandomSecret()
    const message = `${secret}|${batchId}`
    
    // Sign message with viem
    const signature = await walletClient.signMessage({
      message: message
    })
    
    
    const card: any = {
      secret,
      batchId: batchId,
      signature: signature,
    };
  

   await generateQRCodeSVG(card, './output/qr-codes')

   cards.push(card)

  }

  // console.log(cards);
  
  return cards;
}



const batch_size = 10;
const batch_id = "mina_10-10";

generateCardSecrets(batch_id, batch_size)