'use client'

import userSigner from "../context/signer";
import AddressAvatar from "./AddressAvatar";

const ConnectButton = () =>{
    const {address, loading, connectWallet} = userSigner();

    if (address) return <AddressAvatar address={address} />;
    return(
        <button
        className="flex h-10 w-36 items-center justify-center rounded-full bg-black px-2 font-semibold text-white"
        onClick={connectWallet}
        disabled={loading}>
            {loading ? "busy...":"Connect Wallet"}
        </button>
    )
}

export default ConnectButton;