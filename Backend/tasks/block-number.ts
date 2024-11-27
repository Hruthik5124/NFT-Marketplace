import { task } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

task("block-number", "Prints the current block number").setAction(
    async (_taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log("Current block number: ", blockNumber);
    }
)

// module.exports ={}