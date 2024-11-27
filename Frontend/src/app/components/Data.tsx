// /components/Data.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { gql, request } from 'graphql-request';

const query = gql`
  {
    nfts(first: 5) {
      id
      from
      to
      tokenURI
    }
  }
`;

const url = 'https://api.studio.thegraph.com/query/85384/nft-marketplace/version/latest';

export default function Data() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      return await request(url, query);
    },
  });

  return <div>{JSON.stringify(data ?? {})}</div>;
}
