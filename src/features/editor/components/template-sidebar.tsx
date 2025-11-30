import Image from "next/image";
import { AlertTriangle, Loader, Trash2 } from "lucide-react";

import {
  ActiveTool,
  Editor,
} from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { ResponseType, useGetTemplates } from "@/features/projects/api/use-get-templates";
import { useDeleteTemplate } from "@/features/projects/api/use-delete-template";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/hooks/use-confirm";

interface TemplateSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const TemplateSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: TemplateSidebarProps) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to replace the current project with this template."
  )

  const [DeleteConfirmDialog, confirmDelete] = useConfirm(
    "Delete Template?",
    "Are you sure you want to delete this template? This action cannot be undone."
  )

  const { data, isLoading, isError } = useGetTemplates({
    limit: "20",
    page: "1",
  });

  const deleteMutation = useDeleteTemplate();

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = async (template: ResponseType[0]) => {
    const ok = await confirm();

    if (ok) {
      editor?.loadJson(template.json);
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    const ok = await confirmDelete();
    if (ok) {
      deleteMutation.mutate({ id: templateId });
    }
  };

  return (
    <aside
      className={cn(
        "bg-card relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "templates" ? "visible" : "hidden",
      )}
    >
      <ConfirmDialog />
      <DeleteConfirmDialog />
      <ToolSidebarHeader
        title="Templates"
        description="Choose from a variety of templates to get started"
      />
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Failed to fetch templates
          </p>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data && data.map((template) => {
              return (
                <div key={template.id} className="relative group">
                  <button
                    style={{
                      aspectRatio: `${template.width}/${template.height}`
                    }}
                    onClick={() => onClick(template)}
                    className="relative w-full hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                  >
                    <Image
                      fill
                      src={template.thumbnailUrl || ""}
                      alt={template.name || "Template"}
                      className="object-cover"
                    />
                    <div
                      className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left"
                    >
                      {template.name}
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteTemplate(e, template.id)}
                    className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center bg-red-500/80 hover:bg-red-600 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3 text-white" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
