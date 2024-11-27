import React, { useState } from 'react';
import { ethers } from "ethers";
import Button from "./Button";
import CustomDialog from "./CustomDialog";
import { Input } from "./Input";

type SellPopupProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (price: BigInt) => void;
};

const SellPopup: React.FC<SellPopupProps> = ({ open, onClose, onSubmit }) => {
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string>();

  const onConfirm = () => {
    if (!price) return setError("Must be a valid number");
    const wei = ethers.parseEther(price);
    if (wei <= BigInt(0)) return setError("Must be greater than 0");
    onSubmit(wei);
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="List NFT for Sale"
      description="This will list the NFT for sale, you can cancel anytime."
    >
      <div className="flex items-end">
        <div className="mr-2 flex flex-grow flex-col">
          <label
            htmlFor="price"
            className="ml-2 text-xs font-semibold text-gray-500"
          >
            PRICE (ETH)
          </label>
          <Input
            name="price"
            id="price"
            type="number"
            onChange={(e) => setPrice(e.target.value)}
            error={error}
          />
        </div>
        <Button onClick={onConfirm}>CONFIRM</Button>
      </div>
    </CustomDialog>
  );
};

export default SellPopup;
