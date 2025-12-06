import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetImages = (searchQuery?: string) => {
  const query = useQuery({
    queryKey: ["images", searchQuery],
    queryFn: async () => {
      const response = await client.api.images.$get({
        query: searchQuery ? { query: searchQuery } : undefined,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
