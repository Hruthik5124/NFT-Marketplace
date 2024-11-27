import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTMarket } from "../typechain-types/contracts/NFT.sol";
import { NFTMarket__factory } from "../typechain-types/factories/contracts/NFT.sol";
import { any } from "hardhat/internal/core/params/argumentTypes";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("NFTMarket",()=>{
  let nftMarket:any;
  let signers : any;

  before(async ()=>{
    const NFTMarket = await ethers.getContractFactory('NFTMarket');
    nftMarket = await NFTMarket.deploy();
    signers = await ethers.getSigners();
  });

  const createNFT = async (tokenURI: string) =>{
    const transaction = await nftMarket.createNFT(tokenURI);
      const recipt = await transaction.wait();
      let log = recipt?.logs[0];
      const tokenID = ((log as any).args[2]).toString();
      return tokenID;
  }
  
  const createAndListNFT = async(price:number)=>{
    const tokenID = await createNFT('some token uri');
    const transaction = await nftMarket.listNFT(tokenID, price);
    await transaction.wait();
    return tokenID;
  }

  describe("NFTMarket", ()=> {
    it("should create NFT with the correct owner and tokenURI", async ()=>{
      let tokenURI = 'https://some-token.uri/';
      const transaction = await nftMarket.createNFT(tokenURI);
      const recipt = await transaction.wait();
      let log = recipt?.logs[0];
      const tokenID = ((log as any).args[2]).toString();
      //Assert that the newly created NFT's token uri is the same one sent to the createNFT function
      const mintedToken = await nftMarket.tokenURI(tokenID);
      expect(mintedToken).to.equal(tokenURI)
      //Assert that the owner of the newly created NFT is the address that started the transaction
      const ownerAddress = await nftMarket.ownerOf(tokenID); 
      const signers = await ethers.getSigners();
      const currentAddress = await signers[0].getAddress();
      expect(ownerAddress).to.equal(currentAddress);
      //Assert that NFTTransfer event has the correct args
      const args = recipt?.logs[2];
      const result = (args as any ).args;
      expect(result[0]).to.equal(tokenID);
      expect(result[1]).to.equal(ethers.ZeroAddress);
      expect(result[2]).to.equal(ownerAddress);
      expect(result[3]).to.equal(tokenURI);
      expect((result[4]).toString()).to.equal('0')
      // console.log(result);

      // console.log(recipt.logs);
    });
  });

  describe("listNFT", () => {
    const tokenURI = 'some token uri'
    it("It should revert if price zero", async()=>{
      const tokenID = await createNFT(tokenURI);
      const transaction = nftMarket.listNFT(tokenID, 0);
      await expect(transaction).to.be.revertedWith('NFTMarket: price must be greater than 0')
    });

    it("Should revert if not called by the owner", async() => {
      const tokenID = await createNFT(tokenURI);
      const transaction = nftMarket.connect(signers[1]).listNFT(tokenID, 12);
      await expect(transaction).to.be.revertedWith('ERC721: caller is not token owner or approved')
    });
    it("Should list the token for sale if all requirements are met", async() => {
      const price =123
      const tokenID = await createNFT(tokenURI);
      const transaction = await nftMarket.listNFT(tokenID, price);
      const recipt = await transaction.wait();
      //Ownership should be transfered to the contract
      const ownerAddress = await nftMarket.ownerOf(tokenID);
      expect(ownerAddress).to.equal(await nftMarket.getAddress());
      //NFT Transfer should have the correct arguments
      let log = recipt?.logs[1];
      const result = (log as any).args;
      expect(result[0]).to.equal(tokenID);
      expect(result[1]).to.equal(signers[0]);
      expect(result[2]).to.equal(await nftMarket.getAddress());
      expect(result[3]).to.equal('');
      expect(result[4]).to.equal(price);
      // console.log(result);
    });
  });

  describe("buyNFT",()=>{
    it("Should revert if NFT is not listed for sale", async () => {
      await expect(nftMarket.buyNFT(9999)).to.be.revertedWith('NFTMarket: nft not listed for sale');
    });
    it("should revert if the amount of wei sent is not equal to the NFT price",async()=>{
      const tokenID = await createAndListNFT(123);
      await expect(nftMarket.buyNFT(tokenID,{value:124})).to.be.rejectedWith("NFTMarket: incorrect price")
    });
    it("should transfer ownership to the buyer and send the price to the seller",async()=>{
      const price = 123;
      const sellerProfit = Math.floor(price*95/100);
      const fee = price - sellerProfit;
      const initialContractBalance = await ethers.provider.getBalance(nftMarket.getAddress());
      const tokenID = await createAndListNFT(price);
      const initialNFTAddress = await nftMarket.ownerOf(tokenID);
      await new Promise(r=> setTimeout(r, 100));
      const oldSellerBalance = await ethers.provider.getBalance(signers[0]);
      const transaction = await nftMarket.connect(signers[1]).buyNFT(tokenID,{value:price});
      const recipt = await transaction.wait();
      //95% of the price was added  to the seller balance
      await new Promise(r=> setTimeout(r, 100));
      const newSellerBalance = await ethers.provider.getBalance(signers[0]);
      const diff = newSellerBalance - oldSellerBalance ;
      expect(diff).to.equal(sellerProfit);
      //5% of the price was kept in the contract balance
      const newContractBalance = await ethers.provider.getBalance(nftMarket.getAddress());
      const diffContractBalance = newContractBalance - initialContractBalance;
      expect(diffContractBalance).to.be.equal(fee);
      //NFT ownership was transferred to the buyer
      const newNFTAddress = await nftMarket.ownerOf(tokenID);
      expect(initialNFTAddress).not.to.equal(newNFTAddress)
      //NFT Transfer event has the correct arguments
      let log = (recipt?.logs[1]) as any;
      const result = (log as any).args;
      expect(result[0]).to.equal(tokenID);
      expect(result[1]).to.equal(await nftMarket.getAddress());
      expect(result[2]).to.equal(await signers[1].getAddress());
      expect(result[3]).to.equal('');
      expect(result[4]).to.equal(0);
    });
  });
  describe("cancelListing",()=>{
    it("Should revert if the listing NFT is not listed for sale", async()=>{
    const transaction = nftMarket.cancelListing(9999);
    await expect(transaction).to.be.revertedWith("NFTMarket: nft not listed for sale");
    });
    it("should revert if the caller is not the seller of the listing", async()=>{
      const tokenID = await createAndListNFT(123);
      const transaction = nftMarket.connect(signers[1]).cancelListing(tokenID);
      await expect (transaction).to.be.revertedWith("NFTMarket: you're not the seller");
    });
    it("Should transfer the ownership back to the seller", async ()=>{
      const tokenID = await createAndListNFT(123);
      const transaction = await nftMarket.cancelListing(tokenID);
      const recipt = await transaction.wait();
      //check ownership
      const ownerAddress = await nftMarket.ownerOf(tokenID);
      expect(ownerAddress).to.equal(await signers[0].getAddress());
      //check NFTTransfer event
      let log = (recipt?.logs[1]) as any;
      const result = (log as any).args;
      expect(result[0]).to.equal(tokenID);
      expect(result[1]).to.equal(await nftMarket.getAddress());
      expect(result[2]).to.equal(await signers[0].getAddress());
      expect(result[3]).to.equal('');
      expect(result[4]).to.equal(0);
    })
  });
  describe("Withdraw fund",()=>{
    it("Should revert if called by a signer other than the owner", async()=>{
      const transaction = nftMarket.connect(signers[1]).withdrawFunds();
      await expect(transaction).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should transfer all the funds from the contract balance to the owners",async()=>{
      const contracBalance = await ethers.provider.getBalance(nftMarket.getAddress());
      const initialOwnerBalance = await ethers.provider.getBalance(signers[0]);
      const transaction = await nftMarket.connect(signers[0]).withdrawFunds();
      const recipt = await transaction.wait();
      await new Promise(r=> setTimeout(r, 100));
      const newOwnerBalance = await ethers.provider.getBalance(signers[0]);
      const gas = BigInt(recipt.gasUsed * recipt.gasPrice);
      const transfered = (newOwnerBalance + gas) - initialOwnerBalance;
      expect(transfered).to.equal(contracBalance);
    })
    it("Should revert if the contract balance is zero ",async()=>{
      const transaction = nftMarket.withdrawFunds();
      await expect(transaction).to.be.revertedWith("NFTMarket: balance is zero");
    })
  });
});


