import QRCode from 'qrcode'
import { encodePacked, keccak256, toBytes, toHex } from 'viem'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { privateKeyToAccount } from 'viem/accounts';
import { Batch, CardSecret } from '@s3ntiment/shared';


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



export const createBatchWallet = async (services: any) => {
  const seed = crypto.randomUUID();
  const batchSignature = await services.waap.signMessage({ message: `batch:${seed}` });
  const batchPrivKey = keccak256(toBytes(batchSignature));
  const batchAccount = privateKeyToAccount(batchPrivKey);
  
  return {
    batchId: batchAccount.address,
    batchAccount, // kept in memory, never persisted
  };
}


export const solidityPacked = (nullifier: string, batch: Batch): `0x${string}` => {
  // Encode as UTF-8 bytes (what Solidity does with strings)
  const encoder = new TextEncoder();
  const nullifierBytes = encoder.encode(nullifier);
  const pipeBytes = encoder.encode("|");
  
  // Convert to hex
  const nullifierHex = Array.from(nullifierBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const pipeHex = Array.from(pipeBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const addressHex = batch.id.slice(2).toLowerCase();
  
  return ('0x' + nullifierHex + pipeHex + addressHex) as `0x${string}`;
}

export const generateCardSecrets = async (
  batchAccount: any,
  batch: Batch,
) : Promise<CardSecret[]> => {
  const cards = await Promise.all(
    Array.from({ length: batch.amount }, async () => {
      const nullifier = generateRandomNullifier();
      const message = solidityPacked(nullifier, batch) as `0x${string}`;
      const messageHash = keccak256(message);
      const signature = await batchAccount.signMessage({ message: { raw: messageHash } });
      const url = `${baseUrl}?n=${nullifier}&b=${batch.id}&sig=${signature}&s=${batch.survey}`;
      return { nullifier, signature, url, svgString: await generateQRCodeSVG(url) };
    })
  );

  console.log('cards', cards)
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

