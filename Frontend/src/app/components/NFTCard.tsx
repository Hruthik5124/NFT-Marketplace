import React, { useState, useEffect } from 'react';
import AddressAvatar from "./AddressAvatar";
import SellPopup from "./SellPopup";
import useNFTMarket from "../context/NFTMarket";
import { NFT } from "../owned/page";
import { toast } from "react-toastify";
import { ethers } from 'ethers';
import useSigner from '../context/signer';
import Button from '../components/Button'; // Import the Button component

interface NFTCardProps {
  id: string;
  from: string;
  to: string;
  tokenURI: string;
  price: string;
  image: string;
}

const NFTCard: React.FC<NFTCardProps> = (nft) => {
  const { id, from, to, tokenURI, price } = nft;
  const [meta, setMeta] = useState<{ imageURL: string; name: string; description: string; price?: string } | null>(null);
  const [sellPopupOpen, setSellPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { listNFT, cancelListing, buyNFT } = useNFTMarket();
  const NFTPrice = ethers.formatEther(BigInt(price));
  const { address } = useSigner();

  const onSellConfirmed = async (price: BigInt) => {
    setSellPopupOpen(false);
    setLoading(true);
    try {
      await listNFT(id, price);
      toast.success("You listed this NFT for sale. Changes will be reflected shortly.");
    } catch (e) {
      toast.error("Failed to list NFT for sale.");
      console.log(e);
    }
    setLoading(false);
  };

  const onCancelListing = async () => {
    setLoading(true);
    try {
      await cancelListing(id);
      toast.success("You have canceled the listing. Changes will be reflected shortly.");
    } catch (e) {
      toast.error("Failed to cancel the listing.");
      console.log(e);
    }
    setLoading(false);
  };

  const onBuyClicked = async () => {
    setLoading(true);
    try {
      await buyNFT(nft);
      toast.success("Your collection will be updated shortly! Refresh the page.");
    } catch (e) {
      toast.error("Failed to BUY.");
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    async function fetchMetaData() {
      try {
        const response = await fetch(tokenURI);
        const data = await response.json();
        setMeta({
          imageURL: data.image,
          name: data.name,
          description: data.description,
        });
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    }

    fetchMetaData();
  }, [tokenURI]);

  return (
    <div className="flex w-72 flex-shrink-0 flex-col overflow-hidden rounded-xl border font-semibold shadow-sm">
      {meta ? (
        <img
          src={meta.imageURL}
          alt={meta.name}
          className="h-72 w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-80 w-full items-center justify-center">
          loading...
        </div>
      )}
      <div className="flex flex-col p-4">
        <p className="text-base">{meta?.name ?? '...'}</p>
        <span className="text-sm font-normal">
          {meta?.description ?? '...'}
        </span>
        <p className="text-sm font-normal"><AddressAvatar address={to} /></p>
        <p className="text-sm font-bold">{NFTPrice.toString()}ETH</p>
      </div>
      {parseFloat(price) > 0 && from === address ? (
        <Button
          className="group flex h-16 items-center justify-center bg-black text-lg font-semibold text-white"
          onClick={onCancelListing}
          loading={loading}
        >
          CANCEL LISTING
        </Button>
      ) : parseFloat(price) === 0 ? (
        <Button
          className="group flex h-16 items-center justify-center bg-black text-lg font-semibold text-white"
          onClick={() => setSellPopupOpen(true)}
          loading={loading}
        >
          SELL
        </Button>
      ) : null}

      {parseFloat(price) > 0 && from !== address && (
        <Button
          className="group flex h-16 items-center justify-center bg-black text-lg font-semibold text-white mt-2"
          onClick={onBuyClicked}
          loading={loading}
        >
          BUY NOW
        </Button>
      )}

      <SellPopup
        open={sellPopupOpen}
        onClose={() => setSellPopupOpen(false)}
        onSubmit={onSellConfirmed}
      />
    </div>
  );
};

export default NFTCard;
