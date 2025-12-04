import { createWalletClient, createPublicClient, custom, http } from 'viem';
import { baseSepolia } from 'viem/chains'; // or your chain
import { surveyStoreAbi } from './abi.js'

const abi = JSON.parse(surveyStoreAbi);
const SURVEYSTORE = "0x1FaC59fBD1d4eb6EA268894F5AFE81E3219a28EC";

export const register = async (surveyName: string, ipfsCid: string, didNil: string) => {

    // do we force people to register a multisig to administer the survey ??? 


    // const accounts = await window.ethereum.request({ 
    //         method: 'eth_requestAccounts' 
    //     });

    //     // Create wallet client with MetaMask
    //     const walletClient = createWalletClient({
    //         account: accounts[0],
    //         chain: baseSepolia, // Change to your chain
    //         transport: custom(window.ethereum)
    //     });

    //     const publicClient = createPublicClient({
    //         chain: baseSepolia,
    //         transport: http()
    //     });

    //     console.log('Creating survey...');
    //     console.log('Survey Name:', surveyName);
    //     console.log('IPFS CID:', ipfsCid);
    //     console.log('DID Nil:', didNil);

    //     // Call the createSurvey function
    //     const hash = await walletClient.writeContract({
    //         address: SURVEYSTORE,
    //         abi: abi,
    //         functionName: 'createSurvey',
    //         args: [surveyName, ipfsCid, didNil],
    //     });

    //     console.log('Transaction hash:', hash);

    //     // Wait for transaction confirmation
    //     const receipt = await publicClient.waitForTransactionReceipt({ 
    //         hash 
    //     });

    //     console.log('✅ Survey created!');
    //     console.log('Transaction receipt:', receipt);



}