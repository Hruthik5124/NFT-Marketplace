import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConnectButton from "./components/ConnectButton";
import { SignerProvider } from "./context/signer";
import TopBar from "./components/TopBar";
import Providers from './/owned/Providers';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SignerProvider>
      <body className={inter.className}>
      <Providers>
        <TopBar />
        {children}
        </Providers>
        </body>
      </SignerProvider>
    </html>
  );
}
