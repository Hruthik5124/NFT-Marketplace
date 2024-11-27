'use client';

import React, { useEffect, useState } from 'react';
import useNFTMarket from '../context/NFTMarket';
import useSigner from '../context/signer';
import Button from '../components/Button';
import { toast } from "react-toastify";

const WithDrawFunds = () => {
  const {address} = useSigner();
  const { withDrawfunds, getOwnerAddress, ownerAddress } = useNFTMarket();
  const [loading, setLoading] = useState(true);

  const withdraw = async () => {
    setLoading(true);
    try {
      await withDrawfunds();
      toast.success("You have successfully withdrawed funds.");
    } catch (e) {
      toast.error("Failed to cancel the listing.");
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchOwnerAddress = async () => {
      try {
        await getOwnerAddress();
      } catch (error) {
        console.error("Error fetching owner address:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerAddress();
  }, [getOwnerAddress]);

  if (loading) return <p>Loading...</p>;
  
  if(address == ownerAddress?.toLowerCase())
  return (
    <Button
        className="flex h-10 w-36 items-center justify-center rounded-md bg-black px-2 mr-5 font-semibold text-white"
        onClick={withdraw}
        loading={loading}>
            Withdraw
    </Button>
  );
};

export default WithDrawFunds;
