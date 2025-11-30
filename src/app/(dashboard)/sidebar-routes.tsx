"use client";

import { Home, FolderOpen, LayoutTemplate } from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarItem } from "./sidebar-item";

export const SidebarRoutes = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-y-4 flex-1">
      <ul className="flex flex-col gap-y-1 px-3">
        <SidebarItem href="/" icon={Home} label="Home" isActive={pathname === "/"} />
        <SidebarItem href="/projects" icon={FolderOpen} label="My Projects" isActive={pathname === "/projects"} />
        <SidebarItem href="/templates" icon={LayoutTemplate} label="Templates" isActive={pathname === "/templates"} />
      </ul>
    </div>
  );
};
