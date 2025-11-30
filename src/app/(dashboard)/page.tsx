"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { ResponseType, useGetTemplates } from "@/features/projects/api/use-get-templates";
import { TemplateCard } from "./template-card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const mutation = useCreateProject();
  const [showTemplates, setShowTemplates] = useState(false);

  const {
    data: templatesData,
    isLoading: templatesLoading,
    isError: templatesError
  } = useGetTemplates({ page: "1", limit: "20" });

  // Check URL hash on mount and when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#templates") {
        setShowTemplates(true);
      } else {
        setShowTemplates(false);
      }
    };

    handleHashChange(); // Check initial hash
    window.addEventListener("hashchange", handleHashChange);

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleCreateBlank = () => {
    toast.loading("Creating project...");
    mutation.mutate(
      {
        name: "Untitled project",
        json: "",
        width: 900,
        height: 1200,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
      }
    );
  };

  const handleBrowseTemplates = () => {
    setShowTemplates(true);
    window.location.hash = "templates";
  };

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

  const handleBackToHome = () => {
    setShowTemplates(false);
    window.location.hash = "";
  };

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden -m-8">
      {/* Left Side Panel: Preset Sizes */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border p-4 bg-card overflow-y-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-foreground text-lg font-semibold leading-normal px-2">Start with a size</h1>
          <div className="flex flex-col gap-2">
            {/* Instagram Post */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "Instagram Post", json: "", width: 1080, height: 1080 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Instagram Post</p>
                <p className="text-muted-foreground text-xs">1080 × 1080 px</p>
              </div>
            </div>

            {/* Instagram Story */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "Instagram Story", json: "", width: 1080, height: 1920 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="7" y="2" width="10" height="20" rx="2" ry="2" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Instagram Story</p>
                <p className="text-muted-foreground text-xs">1080 × 1920 px</p>
              </div>
            </div>

            {/* Facebook Post */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "Facebook Post", json: "", width: 1200, height: 630 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Facebook Post</p>
                <p className="text-muted-foreground text-xs">1200 × 630 px</p>
              </div>
            </div>

            {/* Facebook Cover */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "Facebook Cover", json: "", width: 820, height: 312 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Facebook Cover</p>
                <p className="text-muted-foreground text-xs">820 × 312 px</p>
              </div>
            </div>

            {/* LinkedIn Post */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "LinkedIn Post", json: "", width: 1200, height: 627 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">LinkedIn Post</p>
                <p className="text-muted-foreground text-xs">1200 × 627 px</p>
              </div>
            </div>

            {/* LinkedIn Banner */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "LinkedIn Banner", json: "", width: 1584, height: 396 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#0A66C2] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">LinkedIn Banner</p>
                <p className="text-muted-foreground text-xs">1584 × 396 px</p>
              </div>
            </div>

            {/* Presentation */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "Presentation", json: "", width: 1920, height: 1080 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10M12 21v-6M3 9h18M4 3h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Presentation</p>
                <p className="text-muted-foreground text-xs">1920 × 1080 px</p>
              </div>
            </div>

            {/* Document */}
            <div
              onClick={() => {
                toast.loading("Creating project...");
                mutation.mutate(
                  { name: "Document", json: "", width: 816, height: 1056 },
                  { onSuccess: ({ data }) => router.push(`/editor/${data.id}`) }
                );
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Document</p>
                <p className="text-muted-foreground text-xs">816 × 1056 px</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Canvas Area */}
      <div className="flex-1 bg-[#090915] flex flex-col p-8 overflow-auto">
        {!showTemplates ? (
          // Welcome View
          <div className="flex flex-col items-center justify-center gap-6 text-center flex-1">
            <h2 className="text-3xl font-bold text-white tracking-tighter">Welcome to Texona!</h2>
            <p className="text-white/60 max-w-md">What will you create today? Start with a professionally designed template or from a blank canvas.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
              <div
                onClick={handleBrowseTemplates}
                className="flex flex-col gap-3 p-4 border border-white/10 rounded-xl bg-[#101022]/50 hover:bg-[#101022] cursor-pointer transition-colors"
              >
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover'
                  }}
                />
                <div>
                  <p className="text-white text-base font-medium leading-normal">Browse Templates</p>
                  <p className="text-white/60 text-sm font-normal leading-normal">Start your design with a professional template.</p>
                </div>
              </div>
              <div
                onClick={handleCreateBlank}
                className="flex flex-col gap-3 p-4 border border-white/10 rounded-xl bg-[#101022]/50 hover:bg-[#101022] cursor-pointer transition-colors"
              >
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
                >
                  <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-base font-medium leading-normal">New Blank Canvas</p>
                  <p className="text-white/60 text-sm font-normal leading-normal">Begin with a fresh, empty workspace.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Templates View
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tighter">Browse Templates</h2>
                <p className="text-white/60 text-sm mt-1">Choose a template to get started quickly</p>
              </div>
              <button
                onClick={handleBackToHome}
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
                  onClick={handleBackToHome}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Back to Home
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Panel: Properties & Suggestions */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex border-b border-border">
            <button className="flex-1 py-2 text-sm font-medium text-foreground border-b-2 border-primary">Properties</button>
            <button className="flex-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Suggestions</button>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-medium">Element Properties</h3>
            <p className="text-sm text-muted-foreground text-center py-8">Select an element on the canvas to see its properties here.</p>
          </div>
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-base font-medium mb-4">Layers</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
                  </svg>
                  <p className="text-sm">Background</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h18M3 10h18M3 15h18" />
                  </svg>
                  <p className="text-sm">Headline Text</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/30">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Logo.png</p>
                </div>
                <svg className="w-5 h-5 text-muted-foreground cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

