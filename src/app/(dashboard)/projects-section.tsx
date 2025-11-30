"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader,
  Search,
} from "lucide-react";

import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ProjectCard } from "./project-card";

export const ProjectsSection = () => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this project.",
  );
  const duplicateMutation = useDuplicateProject();
  const removeMutation = useDeleteProject();
  const router = useRouter();

  const onCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    duplicateMutation.mutate({ id });
  };

  const onDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm();

    if (ok) {
      removeMutation.mutate({ id });
    }
  };

  const {
    data,
    status,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useGetProjects();

  if (status === "pending") {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-64">
        <Loader className="size-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Loading your projects...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-64">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">
          Failed to load projects
        </p>
      </div>
    )
  }

  if (
    !data.pages.length ||
    !data.pages[0].data.length
  ) {
    return (
      <div className="flex flex-col gap-y-4 items-center justify-center h-64">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Search className="size-10 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium mb-1">No projects yet</p>
          <p className="text-muted-foreground text-sm">
            Create your first project to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.pages.map((group, i) => (
          <React.Fragment key={i}>
            {group.data.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                width={project.width}
                height={project.height}
                thumbnailUrl={project.thumbnailUrl}
                updatedAt={project.updatedAt}
                onClick={() => router.push(`/editor/${project.id}`)}
                onCopy={(e) => onCopy(e, project.id)}
                onDelete={(e) => onDelete(e, project.id)}
                disabled={duplicateMutation.isPending || removeMutation.isPending}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      {hasNextPage && (
        <div className="w-full flex items-center justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-[120px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader className="size-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
