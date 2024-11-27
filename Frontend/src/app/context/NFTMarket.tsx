'use client'
import { CreationValues } from "@/app/create/CreationForm";
import { Contract, JsonRpcSigner, JsonRpcProvider } from "ethers";
import NFT_MARKET from '../../../../Backend/artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import useSigner from "./signer";
import { json } from "stream/consumers";
import { TransactionResponse } from "@ethersproject/providers";
import {ethers} from 'ethers';
import {NFT} from '../owned/page';
import { useState } from "react";


const NFT_MARKET_ADDRESS =process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS as string;

const useNFTMarket = ()=>{
    const { signer }:any = useSigner();
    const nftMarket = new Contract(NFT_MARKET_ADDRESS,NFT_MARKET.abi,signer);
    const [ownerAddress, setOwnerAddress] = useState<string | null>(null);

    const createNFT = async(values:CreationValues)=>{
        try{
        const data = new FormData();
        data.append("name",values.name);
        data.append("description",values.description);
        data.append("image",values.image!)
        const response = await fetch("/api/nft-storage", {method:'POST', body:data});
        if(response.status ==201){
            const json = await response.json();
            console.log("tokenURI: ",json.uri);
            const transaction: TransactionResponse = await nftMarket.createNFT(json.uri);
            await transaction.wait();
        }
        }catch(e){
            console.log(e);
        }
    };

    const getOwnerAddress = async () => {
      try {
          const address = await nftMarket.owner();
          setOwnerAddress(address);
      } catch (error) {
          console.error("Error fetching owner address:", error);
      }
  };

    const listNFT = async (tokenID: string, price: BigInt) => {
        const transaction: TransactionResponse = await nftMarket.listNFT(
          tokenID,
          price
        );
        await transaction.wait();
      };
    
      const cancelListing = async (tokenID: string) => {
        const transaction: TransactionResponse = await nftMarket.cancelListing(
          tokenID
        );
        await transaction.wait();
      };
    
      const buyNFT = async (nft: NFT) => {
        const transaction: TransactionResponse = await nftMarket.buyNFT(nft.id, {
          value: nft.price,
        });
        await transaction.wait();
      };

      const withDrawfunds = async ()=>{
        const transaction: TransactionResponse = await nftMarket.withdrawFunds();
        await transaction.wait();
      }

    return{createNFT,
    listNFT,
    cancelListing,
    buyNFT,
    withDrawfunds,
    getOwnerAddress,
    ownerAddress
  };
};

export default useNFTMarket;