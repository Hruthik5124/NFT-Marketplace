import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "./tasks/block-number";
import "hardhat-gas-reporter";
import 'solidity-coverage';

const SEPOLIA_URL = process.env.SEPOLIA_URL! ||"";
const PRIVATE_KEY = process.env.PRIVATE_KEY! ||"";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY! ||"";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY! ||"";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    Sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  solidity: "0.8.24",
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    // coinmarketcap: COINMARKETCAP_API_KEY,
    // L1Etherscan: ETHERSCAN_API_KEY,
    token: "ETH",
  },
};

export default config;