export const getDecryptForOwnerAction = (poolId: string, contract: string, safeAddress: string) => `
async function main({ pkpId, ciphertext, userAddress, signature }) {
  const provider = new ethers.providers.JsonRpcProvider('https://base-mainnet.g.alchemy.com/v2/NFOkRqUo2swIC9g5tRJ7c');

  const signerAddress = ethers.utils.verifyMessage(
      'Request capability to decrypt',
      signature
  );

  const isValid = signerAddress.toLowerCase() === userAddress.toLowerCase();

  if (!isValid) {
      return { error: 'INVALID_SIGNATURE' }
  }
  
  const poolContract = new ethers.Contract(
    '${contract}',
    ['function isPoolSafe(address addr, string poolId) view returns (bool)'],
    provider
  );
  
  if (!await poolContract.isPoolSafe('${safeAddress}', '${poolId}')) {
    return { error: 'Safe is not pool owner' };
  }


  const safe = new ethers.Contract(
    '${safeAddress}',
    ['function isOwner(address owner) view returns (bool)'],
    provider
  );
  
  if (!await safe.isOwner(userAddress)) {
    return { error: 'Not a Safe signer' };
  }

  const plaintext = await Lit.Actions.Decrypt({ pkpId, ciphertext });
  return { plaintext };
}
`;