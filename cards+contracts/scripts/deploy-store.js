// scripts/deploy.js
import hre from "hardhat";
import { config } from "dotenv";

config();

const BLOCK_EXPLORERS = {
  baseSepolia: "https://sepolia.basescan.org",
  base: "https://basescan.org",
  sepolia: "https://sepolia.etherscan.io",
  mainnet: "https://etherscan.io",
};

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying SurveyStore to ${networkName}...\n`);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  try {
    console.log("Getting contract factory...");
    const SurveyStore = await hre.ethers.getContractFactory("S3ntimentSurveyStore");
    
    console.log("Deploying contract...");
    const surveyStore = await SurveyStore.deploy();

    console.log("Waiting for deployment...");
    await surveyStore.waitForDeployment();
    
    const contractAddress = await surveyStore.getAddress();
    console.log("✅ Contract address obtained:", contractAddress);

    const deployTx = surveyStore.deploymentTransaction();
    console.log("Deployment tx hash:", deployTx.hash);
    
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

    console.log("\nVerifying contract bytecode...");
    const code = await hre.ethers.provider.getCode(contractAddress);
    
    if (code === "0x" || code === "0x0") {
      throw new Error("No bytecode at contract address!");
    }
    
    console.log("✅ Contract bytecode confirmed (", code.length, "bytes)");


    console.log("\nWaiting for 5 block confirmations for verification...");
    await deployTx.wait(5);

    console.log("\nVerifying contract on block explorer...");
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
        console.log(`You can verify later with: npx hardhat verify --network ${networkName}`, contractAddress);
      }
    }

    const deploymentInfo = {
      network: networkName,
      contractAddress: contractAddress,
      deployer: deployer.address,
      txHash: deployTx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString(),
    };

    console.log("\n📝 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    const explorer = BLOCK_EXPLORERS[networkName] || `https://${networkName}.etherscan.io`;
    console.log("\n🔗 View on block explorer:");
    console.log(`${explorer}/address/${contractAddress}`);

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