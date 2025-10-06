const litActionDecryptCode = `
const go = async () => {
  try {
    // The PKP can decrypt because it's in the access control conditions
    const decryptedSignature = await Lit.Actions.decryptToString({
      accessControlConditions,
      ciphertext: encryptedSignature, 
      dataToEncryptHash: encryptedSymmetricKey,
      authSig: null, // PKP doesn't need user auth
      chain: 'ethereum'
    });
    
    // Return decrypted signature to frontend
    Lit.Actions.setResponse({
      response: {
        decryptedSignature,
        secret,
        batchId
      }
    });
  } catch (error) {
    Lit.Actions.setResponse({
      response: { error: error.message }
    });
  }
};

go();`