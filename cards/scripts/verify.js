// scripts/verify-store.js
import hre from "hardhat";

async function main() {
  // Your deployed contract address
  const contractAddress = "0xbc865D412fAA8Ca3Be49E72fcA40986D7cbF4555";
  
  console.log("Verifying SurveyStore at:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("\nThis may take a minute...\n");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments
    });
    console.log("\n✅ Contract verified successfully!");
    console.log("\n🔗 View on BaseScan:");
    console.log(`https://sepolia.basescan.org/address/${contractAddress}#code`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract already verified!");
      console.log("\n🔗 View on BaseScan:");
      console.log(`https://sepolia.basescan.org/address/${contractAddress}#code`);
    } else if (error.message.includes("does not have bytecode")) {
      console.error("\n❌ Contract bytecode not found yet.");
      console.log("Wait 1-2 minutes and try again - the indexer may still be processing.");
    } else {
      console.error("\n❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });