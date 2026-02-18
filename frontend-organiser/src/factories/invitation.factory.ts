import QRCode from 'qrcode'
import { keccak256, toHex } from 'viem'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
// import { v4 as uuidv4 } from 'uuid';


const baseUrl = "http://localhost:9999"; // https://s3ntiment.composible.io";

interface CardData {
  nullifier: string
  signature: string
  batchId: string
}


function generateRandomNullifier() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  
  // Convert to base64url
  const base64 = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return base64;
}

async function generateQRCodeSVG(cardData: CardData, surveyId: string): Promise<string> {
  const { nullifier, batchId, signature } = cardData
  
  // Secure URL - only nullifier and batch in QR
  const qrUrl = `${baseUrl}?n=${nullifier}&b=${batchId}&sig=${signature}&s=${surveyId}`;
  console.log(qrUrl);

  // Generate filename
  const filename = `${batchId}_${nullifier}.svg`
//   const filepath = path.join(outputDir, filename)
  
  try {

    return await QRCode.toString(qrUrl, {
      type: 'svg',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
  } catch (error) {
    console.error(`Error generating QR code for ${nullifier}:`, error)
    throw error
  }
}

export const generateCardSecrets = async (viem: any, batchId: string, batchSize: number, surveyId: string) => {
  const cards: any[] = [];
  const zip = new JSZip();
  
  for (let i = 0; i < batchSize; i++) {

    const nullifier = generateRandomNullifier()
    const message = `${nullifier}|${batchId}`
    
    // Hash the message first, then sign the hash
    const messageHash = keccak256(toHex(message));

    console.log(message)
    console.log(messageHash)
   
    
    // Sign the hash with EIP-191 prefix
    const signature = await viem.signMessage(messageHash);

    console.log(signature)
    console.log(viem.walletClient.account.address)
    
    const card: any = {
      nullifier,
      batchId: batchId,
      signature: signature,
    };
  
    let svgString = await generateQRCodeSVG(card, surveyId)
    zip.file(`qr-${String(i + 1).padStart(3, '0')}.svg`, svgString);
    cards.push(card)
  }
  
  const zipBlob = await zip.generateAsync({type: 'blob'});
  saveAs(zipBlob, `s3ntiment-qr-codes-${surveyId}.zip`);
  return cards;
}