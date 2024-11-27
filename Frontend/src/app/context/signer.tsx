'use client'
import React,{ createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {JsonRpcProvider, JsonRpcSigner} from "@ethersproject/providers";
import {ethers} from "ethers";
import { sign } from "crypto";

type SignerContextType ={
    signer?:JsonRpcSigner;
    address?: string;
    // loading: boolean;
    // connectWallet: () => Promise<void>;
};

const SignerContext = createContext<SignerContextType >({} as any);

const useSigner = () => useContext(SignerContext);

export const SignerProvider = ({children}:{children:ReactNode}) => {
    const [signer, setSigner] = useState<JsonRpcSigner>()
    const [address, setAddress] = useState<string>()
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        autoConnect();
        addWalletListener();
    })

    const connectWallet = async () =>{
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            setLoading(true);
            try {
                const instance = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
                let provider = new ethers.BrowserProvider(window.ethereum);
                const signer = (await provider.getSigner()) as any;
                const account = instance[0];
                setSigner(signer);
                console.log("THIS IS SIGNERCONTEXT: ", signer);
                setAddress(account);

                // You can now use the accounts[0] (the connected address) in your application
            } catch (err: any) {
                if (err.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    console.error("User rejected the request");
                    // alert("You need to connect your wallet to proceed.");
                } else {
                    console.error("Error connecting to MetaMask:", err.message);
                }
            }
        } else {
            console.log("Please install MetaMask");
            alert("MetaMask is not installed. Please install it to connect your wallet.");
        }
    setLoading(false);
    }

    const autoConnect = async () =>{
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            try {
                const instance = await window.ethereum.request({ method: "eth_accounts" }) as string[];
                const account = instance[0];
                let provider = new ethers.BrowserProvider(window.ethereum);
                const signer = (await provider.getSigner()) as any;
                setSigner(signer);
                if(account.length>0){
                    setAddress(account);
                    // console.log(account);
                }else{
                    console.log("Connect wallet");
                }
            } catch (err: any) {
                if (err.code === 4001) {
                    // EIP-1193 userRejectedRequest error
                    console.error("User rejected the request");
                    // alert("You need to connect your wallet to proceed.");
                } else {
                    console.error("Error connecting to MetaMask:", err.message);
                }
            }
        } else {
            console.log("Please install MetaMask");
            alert("MetaMask is not installed. Please install it to connect your wallet.");
        }
    }
    const addWalletListener = async () =>{
        if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
            if(window.ethereum?.on){
                window.ethereum.on("accountsChanged",(accounts)=>{
                    setAddress(accounts[0]);
                })
            }
        } else {
            setAddress("");
            console.log("Please install MetaMask");
            // alert("MetaMask is not installed. Please install it to connect your wallet.");
        }
    }

    const contextValue = {signer,address,loading,connectWallet}  

    return <SignerContext.Provider value={contextValue}> {children}</SignerContext.Provider>
}

export default useSigner;