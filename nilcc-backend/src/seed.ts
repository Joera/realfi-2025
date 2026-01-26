// import { Bip39, Secp256k1, Slip10, Slip10Curve, stringToPath } from "@cosmjs/crypto";
// import { toBech32 } from "@cosmjs/encoding";
// import { rawSecp256k1PubkeyToRawAddress } from "@cosmjs/amino";

// async function findNillionKey(mnemonic: any, targetAddress: any) {
//   const seed = await Bip39.mnemonicToSeed(mnemonic);
  
//   console.log('🔍 Searching for address:', targetAddress);
//   console.log('');
  
//   // Try various coin types that Nillion might use
//   // 118 is standard Cosmos, but they might use a custom one
//   const coinTypes = [118, 529, 564, 330, 639, 714, 880, 931];
  
//   // Try different prefixes in case
//   const prefixes = ['nillion', 'nillion1'];
  
//   for (const prefix of prefixes) {
//     console.log(`\n--- Trying prefix: ${prefix} ---`);
    
//     for (const coinType of coinTypes) {
//       // Try first 3 accounts and first 3 indices
//       for (let account = 0; account < 3; account++) {
//         for (let index = 0; index < 3; index++) {
//           const path = `m/44'/${coinType}'/${account}'/0/${index}`;
          
//           try {
//             const { privkey } = Slip10.derivePath(
//               Slip10Curve.Secp256k1,
//               seed,
//               stringToPath(path)
//             );
            
//             const { pubkey } = await Secp256k1.makeKeypair(privkey);
//             const compressedPubkey = Secp256k1.compressPubkey(pubkey);
//             const address = toBech32(prefix, rawSecp256k1PubkeyToRawAddress(compressedPubkey));
            
//             // Only log if it starts similarly
//             if (address.substring(0, 10) === targetAddress.substring(0, 10)) {
//               console.log(`🔸 CLOSE: ${path} -> ${address}`);
//             }
            
//             if (address === targetAddress) {
//               console.log('\n🎉 ✅ MATCH FOUND!');
//               console.log('=====================================');
//               console.log('Derivation Path:', path);
//               console.log('Coin Type:', coinType);
//               console.log('Private Key (hex):', Buffer.from(privkey).toString('hex'));
//               console.log('Public Key (hex):', Buffer.from(compressedPubkey).toString('hex'));
//               console.log('Address:', address);
//               console.log('=====================================');
//               return {
//                 path,
//                 coinType,
//                 privateKey: Buffer.from(privkey).toString('hex'),
//                 publicKey: Buffer.from(compressedPubkey).toString('hex'),
//                 address
//               };
//             }
//           } catch (e) {
//             // Skip invalid paths
//           }
//         }
//       }
//     }
//   }
  
//   console.log('\n❌ No exact match found.');
//   console.log('\n💡 Tips:');
//   console.log('1. Double-check the mnemonic is correct');
//   console.log('2. Verify the target address');
//   console.log('3. Check Nillion docs for their specific coin type');
//   console.log('4. Try looking in Keplr settings for chain info');
// }

// // Usage
// const seedPhrase = "eager come below stock trip method step nation excuse apple window trash";
// const nillionAddress = "nillion1epa5xfjf3qkx8vtzg86thsj5squpkrmdxxfldh"; // Your full address

// findNillionKey(seedPhrase, nillionAddress);