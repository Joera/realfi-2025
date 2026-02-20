import { hashMessage, keccak256, recoverAddress, recoverMessageAddress, toHex, verifyMessage } from "viem"


export interface CardData {
  nullifier: string
  batchId: string
  signature: string
  surveyOwner: string
  surveyId: string
}

/**
 * Parse card data from URL query parameters
 * Expected format: https://s3ntiment.eth.link?s=secret&b=batchId&sig=signature
 */
export const parseCardURL = async (): Promise<CardData | null> => {
  try {
    // Get current URL
    const url = new URL(window.location.href)
    const params = url.searchParams
    
    // Extract parameters
    const nullifier = params.get('n')
    const batchId = params.get('b') 
    const signature = params.get('sig')
    const surveyId = params.get('s')
    
    // Validate all required parameters are present
    if (!nullifier || !batchId || !signature || !surveyId) {
      console.error('Missing required parameters:', {
        nullifier: !!nullifier,
        batchId: !!batchId,
        signature: !!signature
      })
      return null
    }

    const msg: string = `${decodeURIComponent(nullifier)}|${decodeURIComponent(batchId)}`;
    // const msgHash = keccak256(toHex(msg));
    const s: any = decodeURIComponent(signature) as `0x${string}` 

    const recoveredAddress = await recoverMessageAddress({
      message: msg,
      signature: s
    });

    return {
      nullifier: decodeURIComponent(nullifier),
      batchId: decodeURIComponent(batchId),
      signature: decodeURIComponent(signature),
      surveyOwner: recoveredAddress,
      surveyId: decodeURIComponent(surveyId)
    }
    
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
}