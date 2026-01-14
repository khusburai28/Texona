import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.ai["content-recommender"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.ai["content-recommender"]["$post"]>["json"];

export const useContentRecommender = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.ai["content-recommender"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to generate content recommendations");
      }

      return await response.json();
    },
  });

  return mutation;
};
