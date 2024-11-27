'use client'

import {
  HydrationBoundary,
  QueryClient,
  useQuery,
  QueryClientProvider,
} from '@tanstack/react-query';
import { gql, request } from 'graphql-request';
import NFTCard from './components/NFTCard';
import React, { useState, useEffect } from 'react';
import useSigner from './context/signer';
import LoadingScreen from './components/LoadingScreen';
import SmallLoadingSpinner from './components/SmallLoadingSpinner';


// Updated GraphQL query
const query = gql`
  query getNFTs($from: String!, $marketplaceAddress: String!) {
    nfts(where: { to: $marketplaceAddress, from_not: $from }) {
      id
      from
      to
      price
      tokenURI
    }
  }
`;

const url = 'https://api.studio.thegraph.com/query/85384/nft-marketplace/version/latest';

export interface NFT {
  id: string;
  from: string;
  to: string;
  price: string;
  tokenURI: string;
}

interface QueryData {
  nfts: NFT[];
}

const NFTGrid: React.FC<{ from: string; marketplaceAddress: string }> = ({ from, marketplaceAddress }) => {
  const { data, error, isLoading } = useQuery<QueryData>({
    queryKey: ['nfts', from, marketplaceAddress],
    queryFn: () => request<QueryData>(url, query, { from, marketplaceAddress }),
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="flex flex-wrap gap-4 mt-8">
      {data?.nfts.map((nft) => (
        <NFTCardWrapper key={nft.id} nft={nft} />
      ))}
    </div>
  );
};

const NFTCardWrapper: React.FC<{ nft: NFT }> = ({ nft }) => {
  const [image, setImage] = useState<string | null>(null);
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(nft.tokenURI);
        const data = await response.json();
        setImage(data.image);
        setPrice(nft.price);
      } catch (error) {
        console.error('Failed to fetch image:', error);
      }
    };

    fetchImage();
  }, [nft.tokenURI]);

  if (!image) return <SmallLoadingSpinner />;
  if (!price) return <SmallLoadingSpinner />;

  return (
    <div className="w-72 mt-12">
      <NFTCard id={nft.id} from={nft.from} to={nft.to} price={price} tokenURI={nft.tokenURI} image={image} />
    </div>
  );
};

export default function HomePage() {
  const queryClient = new QueryClient();
  const { address } = useSigner();

  // Replace this with your actual marketplace address
  const marketplaceAddress = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS as string;

  // Ensure that both address and marketplaceAddress are defined before rendering NFTGrid
  if (!address || !marketplaceAddress) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary>
        <NFTGrid from={address} marketplaceAddress={marketplaceAddress} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
