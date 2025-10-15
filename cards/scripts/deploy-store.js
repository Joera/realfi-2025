// scripts/deploy.js
import hre from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  console.log("Deploying SurveyStore to Base Sepolia...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  try {
    // Deploy the contract
    console.log("Getting contract factory...");
    const SurveyStore = await hre.ethers.getContractFactory("SurveyStore");
    
    console.log("Deploying contract...");
    const surveyStore = await SurveyStore.deploy();

    console.log("Waiting for deployment...");
    await surveyStore.waitForDeployment();
    
    const contractAddress = await surveyStore.getAddress();
    console.log("✅ Contract address obtained:", contractAddress);

    // Get the deployment transaction
    const deployTx = surveyStore.deploymentTransaction();
    console.log("Deployment tx hash:", deployTx.hash);
    
    // Wait for confirmations and check receipt
    console.log("\nWaiting for transaction confirmations...");
    const receipt = await deployTx.wait(3);
    
    console.log("Transaction receipt:");
    console.log("  - Status:", receipt.status === 1 ? "✅ SUCCESS" : "❌ FAILED");
    console.log("  - Block:", receipt.blockNumber);
    console.log("  - Gas used:", receipt.gasUsed.toString());
    console.log("  - Contract address:", receipt.contractAddress);
    
    if (receipt.status !== 1) {
      throw new Error("Transaction failed!");
    }

    // Verify bytecode exists
    console.log("\nVerifying contract bytecode...");
    const code = await hre.ethers.provider.getCode(contractAddress);
    
    if (code === "0x" || code === "0x0") {
      throw new Error("No bytecode at contract address - deployment failed!");
    }
    
    console.log("✅ Contract bytecode confirmed (", code.length, "bytes)");

    // Test the contract
    console.log("\n🧪 Testing contract interaction...");
    const exists = await surveyStore.surveyExists(deployer.address, "test");
    console.log("✅ Contract is functional! Test query returned:", exists);

    // Wait for more confirmations before verifying
    console.log("\nWaiting for 5 block confirmations for verification...");
    await deployTx.wait(5);

    // Verify the contract on Basescan
    console.log("\nVerifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract already verified!");
      } else {
        console.error("❌ Verification failed:", error.message);
        console.log("You can verify later with: npx hardhat verify --network baseSepolia", contractAddress);
      }
    }

    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployer: deployer.address,
      txHash: deployTx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString(),
    };

    console.log("\n📝 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🔗 View on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${contractAddress}`);

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    
    if (error.transaction) {
      console.log("\nTransaction details:");
      console.log(error.transaction);
    }
    
    if (error.receipt) {
      console.log("\nReceipt details:");
      console.log(error.receipt);
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });