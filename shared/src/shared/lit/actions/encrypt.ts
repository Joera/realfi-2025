// Action: Encrypt (API key gates access, no on-chain check needed)
export const encryptAction = `
async function main({ pkpId, message }) {
  const ciphertext = await Lit.Actions.Encrypt({ pkpId, message });
  return { ciphertext };
}
`;