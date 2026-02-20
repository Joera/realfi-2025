import { config } from "dotenv";
import "hardhat-deploy";
import "hardhat-deploy/register";

config();

export default {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    base: {
      type: "http",
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: [process.env.ETH_PRIVATE_KEY],
      chainId: 8453,
    },
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: [process.env.ETH_PRIVATE_KEY],
      chainId: 84532,
    },
  },
};


// import { config } from "dotenv";
// import "@nomicfoundation/hardhat-ethers";
// import "@nomicfoundation/hardhat-verify";
// import "hardhat-deploy";

// config();

// export default {
//   defaultNetwork: "baseSepolia",
//   solidity: {
//     version: "0.8.24",
//     settings: {
//       optimizer: {
//         enabled: true,
//         runs: 200,
//       },
//       viaIR: true,
//     },
//   },
//   sourcify: {
//     enabled: true,
//   },
//   namedAccounts: {
//     deployer: 0,
//   },
//   networks: {
//     base: {
//       url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
//       accounts: [process.env.ETH_PRIVATE_KEY],
//       chainId: 8453,
//     },
//     baseSepolia: {
//       url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
//       accounts: [process.env.ETH_PRIVATE_KEY],
//       chainId: 84532,
//     },
//   },
//   etherscan: {
//     apiKey: process.env.ETHERSCAN_API_KEY,
//     customChains: [
//       {
//         network: "base",
//         chainId: 8453,
//         urls: {
//           apiURL: "https://api.basescan.org/api",
//           browserURL: "https://basescan.org",
//         },
//       },
//       {
//         network: "baseSepolia",
//         chainId: 84532,
//         urls: {
//           apiURL: "https://api-sepolia.basescan.org/api",
//           browserURL: "https://sepolia.basescan.org",
//         },
//       },
//     ],
//   },
// };