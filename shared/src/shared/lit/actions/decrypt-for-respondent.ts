export const getDecryptForRespondentAction = (poolId: string, contract: string) => `
async function main({ pkpId, ciphertext, userAddress }) {
  const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
  
  const poolContract = new ethers.Contract(
    "${contract}",
    ["function isPoolMember(string poolId, address member) view returns (bool)"],
    provider
  );
  
  const isMember = await poolContract.isPoolMember("${poolId}", userAddress);
  
  if (!isMember) {
    return { error: "Not a pool member" };
  }

  const plaintext = await Lit.Actions.Decrypt({ pkpId, ciphertext });
  return { plaintext };
}
`;
