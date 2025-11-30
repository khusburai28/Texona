"use client";

import { useRouter } from "next/navigation";
import { ProjectsSection } from "../projects-section";

export default function ProjectsPage() {
  const router = useRouter();

  const handleCreateBlank = () => {
    router.push("/#create-blank");
  };

  return (
    <div className="flex h-[calc(100vh-68px)] overflow-hidden -m-8">
      {/* Left Side Panel: Quick Actions */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-border p-4 bg-card overflow-y-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-foreground text-lg font-semibold leading-normal px-2">Quick Actions</h1>
          <div className="flex flex-col gap-2">
            {/* Create New Project */}
            <div
              onClick={handleCreateBlank}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">New Project</p>
                <p className="text-muted-foreground text-xs">Create blank canvas</p>
              </div>
            </div>

            {/* Browse Templates */}
            <div
              onClick={() => router.push("/templates")}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium leading-normal">Browse Templates</p>
                <p className="text-muted-foreground text-xs">Start from a template</p>
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
              <h2 className="text-2xl font-bold text-white tracking-tighter">My Projects</h2>
              <p className="text-white/60 text-sm mt-1">Manage and edit your design projects</p>
            </div>
            <button
              onClick={handleCreateBlank}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <ProjectsSection />
          </div>
        </div>
      </div>

      {/* Right Side Panel: Project Stats */}
      <aside className="flex h-full w-[280px] shrink-0 flex-col border-l border-border bg-card p-4">
        <div className="flex flex-col gap-4">
          <div className="flex border-b border-border">
            <button className="flex-1 py-2 text-sm font-medium text-foreground border-b-2 border-primary">Overview</button>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-medium">Project Statistics</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-accent/50">
                <p className="text-xs text-muted-foreground mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50">
                <p className="text-xs text-muted-foreground mb-1">Created This Week</p>
                <p className="text-2xl font-bold text-foreground">—</p>
              </div>
              <div className="p-3 rounded-lg bg-accent/50">
                <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                <p className="text-sm font-medium text-foreground">—</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-base font-medium mb-4">Quick Tips</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Click any project to open it in the editor</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Use the dropdown menu to duplicate or delete projects</p>
              </div>
              <div className="flex gap-2">
                <svg className="w-4 h-4 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Projects are automatically saved as you work</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
