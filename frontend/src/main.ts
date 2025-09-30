import { CardData, parseCardURL } from "./card.factory"
import { promptDeviceAuthentication } from './webauthn.factory'

const main = async () => {


    const card: CardData | null = parseCardURL();

    console.log(card);

    try {
        const credential = await promptDeviceAuthentication()
        console.log("Device nullifier:", credential.deviceNullifier)
        
        // Use this nullifier for your smart contract
        // It will be the same every time on this device
    } catch (error: any) {
        console.error("Authentication failed:", error.message)
    }
        

}

main()