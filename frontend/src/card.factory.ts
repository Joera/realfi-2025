

export interface CardData {
  nullifier: string
  batchId: string
  signature: string
}

/**
 * Parse card data from URL query parameters
 * Expected format: https://s3ntiment.eth.link?s=secret&b=batchId&sig=signature
 */
export const parseCardURL = (): CardData | null => {
  try {
    // Get current URL
    const url = new URL(window.location.href)
    const params = url.searchParams
    
    // Extract parameters
    const nullifier = params.get('n')
    const batchId = params.get('b') 
    const signature = params.get('sig')
    
    // Validate all required parameters are present
    if (!nullifier || !batchId || !signature) {
      console.error('Missing required parameters:', {
        nullifier: !!nullifier,
        batchId: !!batchId,
        signature: !!signature
      })
      return null
    }
    
    return {
      nullifier: decodeURIComponent(nullifier),
      batchId: decodeURIComponent(batchId),
      signature: decodeURIComponent(signature)
    }
    
  } catch (error) {
    console.error('Error parsing URL:', error)
    return null
  }
}