import { CardData, parseCardURL } from "./card.factory.js"
// import { promptDeviceAuthentication } from './webauthn.factory.js'

const main = async () => {


    const card: CardData | null = parseCardURL();

    console.log(card);

    const hnInput = `${name}|${password}|${cardSecret}`
    const seed = await humanNetwork.voprf(hnInput)

    // Store card secret encrypted with password
    const encryptedSecret = encrypt(cardSecret, password)
    localStorage.setItem('cardSecret', encryptedSecret)

    // On return: decrypt and use
    const cardSecret = decrypt(localStorage.getItem('cardSecret'), password)

    // try {
    //     const credential = await promptDeviceAuthentication()
    //     console.log("Device nullifier:", credential.deviceNullifier)
        
    //     // Use this nullifier for your smart contract
    //     // It will be the same every time on this device
    // } catch (error: any) {
    //     console.error("Authentication failed:", error.message)
    // }
        

}

main()