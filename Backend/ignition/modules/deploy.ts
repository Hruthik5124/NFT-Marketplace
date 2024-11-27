//imports
import { ethers, run, network } from "hardhat";
import "@nomicfoundation/hardhat-verify";
import 'dotenv/config';

//async main
async function main() {
  const NFTMarket = await ethers.getContractFactory('NFTMarket');
  const nftMarket = await NFTMarket.deploy();
  const DeployedAddress = await nftMarket.getAddress()
  console.log("Deployed to: ",DeployedAddress);
}

//main
main()
.then(()=>process.exit(0)).catch((error)=>{
  console.error(error);
  process.exit(1);
});