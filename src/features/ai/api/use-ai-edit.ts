import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<typeof client.api.ai["edit-canvas"]["$post"]>;
type RequestType = InferRequestType<typeof client.api.ai["edit-canvas"]["$post"]>["json"];

export const useAiEdit = () => {
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async (json) => {
      const response = await client.api.ai["edit-canvas"].$post({ json });
      return await response.json();
    },
  });

  return mutation;
};
