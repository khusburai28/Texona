import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.ai["aesthetic-score"]["$post"], 200>;
type RequestType = InferRequestType<typeof client.api.ai["aesthetic-score"]["$post"]>["json"];

export const useAestheticScore = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.ai["aesthetic-score"]["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to calculate aesthetic score");
      }

      return await response.json();
    },
  });

  return mutation;
};
