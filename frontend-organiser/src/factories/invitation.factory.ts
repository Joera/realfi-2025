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
  url: string
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

async function generateQRCodeSVG(url: string): Promise<string> {
  
  try {

    return await QRCode.toString(url, {
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
    console.error(`Error generating QR code for ${url}:`, error)
    throw error
  }
}

export const generateCardSecrets = async (services: any, batchId: string, batchSize: number, surveyId: string) => {
  const cards: any[] = [];
 
  
  for (let i = 0; i < batchSize; i++) {

    const nullifier = generateRandomNullifier()
    const message = `${nullifier}|${batchId}`
    
    const signature = await services.waap.signMessage(message);
    
    const card: any = {
      nullifier,
      batchId: batchId,
      signature: signature,
      url:`${baseUrl}?n=${nullifier}&b=${batchId}&sig=${signature}&s=${surveyId}`
    };
  
    card.svgString = await generateQRCodeSVG(card.url)
   
    cards.push(card)
  }
  
  return cards;
}

export const createZipFile = async (cards: any[], surveyId: string) => {

  const zip = new JSZip();
  let i = 0;
  for (let card of cards) {
      zip.file(`qr-${String(i + 1).padStart(3, '0')}.svg`, card.svgString);
      i++;
  }
  const zipBlob = await zip.generateAsync({type: 'blob'});
  saveAs(zipBlob, `s3ntiment-qr-codes-${surveyId}.zip`);
}