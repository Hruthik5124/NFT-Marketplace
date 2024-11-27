'use client'
import React from "react";
import EmptyState from "../../components/EmptyState";
import classNames from "classnames";
import useSigner from "../../context/signer"
import CreationForm, {CreationValues}  from "./index";
import useNFTMarket from "../../context/NFTMarket";

const CreationPage = () => {
  const {signer} = useSigner();
  const {createNFT} = useNFTMarket();
  
  return (
    <div className={classNames("flex h-full w-full flex-col")}>
      {!signer && <EmptyState>Connect your wallet</EmptyState>}
      {signer && <CreationForm onSubmit={createNFT} />}
    </div>
  );
};

export default CreationPage;
