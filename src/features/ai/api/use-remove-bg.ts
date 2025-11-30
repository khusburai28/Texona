"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface RequestType {
  image: string;
}

interface ResponseType {
  data: string;
}

export const useRemoveBg = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ image }) => {
      // Dynamically import the background removal library (client-side only)
      const { removeBackground } = await import("@imgly/background-removal");

      // Convert image URL to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Remove background
      const resultBlob = await removeBackground(blob, {
        progress: (key, current, total) => {
          console.log(`Processing: ${key} - ${Math.round((current / total) * 100)}%`);
        },
      });

      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve({ data: base64String });
        };
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });
    },
    onSuccess: () => {
      toast.success("Background removed successfully");
    },
    onError: (error) => {
      console.error("Background removal error:", error);
      toast.error("Failed to remove background");
    },
  });

  return mutation;
};
