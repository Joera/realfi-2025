// scripts/deploy.js
import hre from "hardhat";
import { config } from "dotenv";

config();

async function main() {
  console.log("Deploying CardValidator to Base Sepolia...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Set your initial public key address here
  const initialPublicKey = process.env.INITIAL_PUBLIC_KEY || deployer.address;
  console.log("Initial public key will be set to:", initialPublicKey);

  // Deploy the contract
  const CardValidator = await hre.ethers.getContractFactory("CardValidator");
  const cardValidator = await CardValidator.deploy(initialPublicKey);

  await cardValidator.waitForDeployment();
  const contractAddress = await cardValidator.getAddress();

  console.log("\n✅ CardValidator deployed to:", contractAddress);

  // Wait for the deployment transaction to be mined
  console.log("Waiting for deployment transaction to be mined...");
  const deployTx = cardValidator.deploymentTransaction();
  await deployTx.wait(3); // Wait for 1 confirmation first

  // Now we can safely read the state
  console.log("Owner:", await cardValidator.owner());
  console.log("Public Key:", await cardValidator.publicKey());

  // Wait for more confirmations before verifying
  console.log("\nWaiting for 5 block confirmations for verification...");
  await deployTx.wait(5);

  // Verify the contract on Basescan
  console.log("\nVerifying contract on Basescan...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [initialPublicKey],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    owner: await cardValidator.owner(),
    publicKey: await cardValidator.publicKey(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  console.log("\n📝 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });