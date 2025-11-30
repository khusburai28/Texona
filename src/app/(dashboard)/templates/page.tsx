"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useDeleteTemplate } from "@/features/projects/api/use-delete-template";
import { ResponseType, useGetTemplates } from "@/features/projects/api/use-get-templates";
import { TemplateCard } from "../template-card";
import { useConfirm } from "@/hooks/use-confirm";

export default function TemplatesPage() {
  const router = useRouter();
  const mutation = useCreateProject();
  const deleteMutation = useDeleteTemplate();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Template?",
    "Are you sure you want to delete this template? This action cannot be undone."
  );

  const {
    data: templatesData,
    isLoading: templatesLoading,
    isError: templatesError
  } = useGetTemplates({ page: "1", limit: "20" });

  const handleTemplateClick = (template: ResponseType[0]) => {
    toast.loading("Creating project...");
    mutation.mutate(
      {
        name: `${template.name} project`,
        json: template.json,
        width: template.width,
        height: template.height,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
      }
    );
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate({ id: templateId });
    }
  };

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden -m-8">
      <ConfirmDialog />

      {/* Left Side Panel: Quick Actions */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border p-4 bg-card overflow-y-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-foreground text-lg font-semibold leading-normal px-2">Quick Actions</h1>
          <div className="flex flex-col gap-2">
            {/* Create New Project */}
            <div
              onClick={() => router.push("/")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">New Blank Canvas</p>
                <p className="text-muted-foreground text-xs">Start from scratch</p>
              </div>
            </div>

            {/* My Projects */}
            <div
              onClick={() => router.push("/projects")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">My Projects</p>
                <p className="text-muted-foreground text-xs">View your projects</p>
              </div>
            </div>

            {/* Back to Home */}
            <div
              onClick={() => router.push("/")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Back to Home</p>
                <p className="text-muted-foreground text-xs">Return to dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Canvas Area */}
      <div className="flex-1 bg-[#090915] flex flex-col p-8 overflow-auto">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tighter">Browse Templates</h2>
              <p className="text-white/60 text-sm mt-1">Choose a template to get started quickly</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>

          {templatesLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader className="size-8 text-white/60 animate-spin" />
            </div>
          )}

          {templatesError && (
            <div className="flex flex-col gap-y-4 items-center justify-center h-64">
              <TriangleAlert className="size-8 text-white/60" />
              <p className="text-white/60">Failed to load templates</p>
            </div>
          )}

          {!templatesLoading && !templatesError && templatesData && templatesData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-8">
              {templatesData.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.name}
                  imageSrc={template.thumbnailUrl || ""}
                  onClick={() => handleTemplateClick(template)}
                  disabled={mutation.isPending}
                  description={`${template.width} × ${template.height} px`}
                  width={template.width}
                  height={template.height}
                  isPro={template.isPro || false}
                  onDelete={(e) => handleDeleteTemplate(e, template.id)}
                />
              ))}
            </div>
          )}

          {!templatesLoading && !templatesError && templatesData && templatesData.length === 0 && (
            <div className="flex flex-col gap-y-4 items-center justify-center h-64">
              <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-white/60">No templates available</p>
              <button
                onClick={() => router.push("/")}
                className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Panel: Template Categories */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex border-b border-border">
            <button className="flex-1 py-2 text-sm font-medium text-foreground border-b-2 border-primary">All Templates</button>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-medium">Categories</h3>
            <div className="space-y-2 text-sm">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                Social Media
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                Marketing
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                Presentations
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                Documents
              </button>
            </div>
          </div>
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-base font-medium mb-4">Quick Tips</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Click any template to create a new project</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Hover to see delete option for custom templates</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Templates are fully customizable in the editor</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
