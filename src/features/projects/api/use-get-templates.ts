"use client";

import { useQuery } from "@tanstack/react-query";
import { Project, getProjectsFromStorage } from "./use-get-projects";

export type ResponseType = Project[];

interface RequestType {
  page: string;
  limit: string;
}

export const useGetTemplates = (apiQuery: RequestType) => {
  const query = useQuery({
    queryKey: [
      "templates",
      {
        page: apiQuery.page,
        limit: apiQuery.limit,
      },
    ],
    queryFn: async () => {
      const page = parseInt(apiQuery.page);
      const limit = parseInt(apiQuery.limit);

      const allTemplates = getProjectsFromStorage()
        .filter(p => p.isTemplate)
        .sort((a, b) => {
          // Sort by isPro first (non-pro first), then by updatedAt
          if (a.isPro !== b.isPro) return (a.isPro ? 1 : 0) - (b.isPro ? 1 : 0);
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

      const start = (page - 1) * limit;
      const end = start + limit;

      return allTemplates.slice(start, end);
    },
  });

  return query;
};
