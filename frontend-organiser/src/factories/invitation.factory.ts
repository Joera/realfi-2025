/// <reference types="vite/client" />

import QRCode from 'qrcode'
import { encodePacked, keccak256, toBytes, toHex } from 'viem'
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { privateKeyToAccount } from 'viem/accounts';
import { Batch, CardData } from '@s3ntiment/shared';

const BASEURL = import.meta.env.VITE_PROD == "true" ? import.meta.env.VITE_FRONTEND_PROD : import.meta.env.VITE_FRONTEND_DEV;  

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
  const batchSignature = await services.safe.signMessage(`batch:${seed}`);
  const batchPrivKey = keccak256(toBytes(batchSignature));
  const batchAccount = privateKeyToAccount(batchPrivKey);
  
  return {
    batchId: batchAccount.address,
    batchAccount, // kept in memory, never persisted
  };
}

export const generateCardSecrets = async (
  batchAccount: any,
  batch: Batch,
) : Promise<CardData[]> => {
  const cards = await Promise.all(
    Array.from({ length: batch.amount }, async () => {
      const nullifier = generateRandomNullifier();
      
      const packed = encodePacked(
        ['string', 'string', 'address'],
        [nullifier, '|', batch.id as `0x${string}`]
      );
      const messageHash = keccak256(packed);
      const signature = await batchAccount.signMessage({ message: { raw: messageHash } });
      
      const url = `${BASEURL}?n=${nullifier}&b=${batch.id}&sig=${signature}&s=${batch.survey}`;
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

