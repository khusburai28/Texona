import Image from "next/image";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useRemoveBg } from "@/features/ai/api/use-remove-bg";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RemoveBgSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const RemoveBgSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: RemoveBgSidebarProps) => {
  const mutation = useRemoveBg();

  const selectedObject = editor?.selectedObjects[0];

  // @ts-ignore
  const imageSrc = selectedObject?._originalElement?.currentSrc;

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const onClick = () => {
    mutation.mutate({
      image: imageSrc,
    }, {
      onSuccess: ({ data }) => {
        editor?.addImage(data);
      },
    });
  };

  return (
    <aside
      className={cn(
        "bg-card relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "remove-bg" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="Background removal"
        description="Remove background from image using AI"
      />
      {!imageSrc && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">
            Feature not available for this object
          </p>
        </div>
      )}
      {imageSrc && (
        <ScrollArea>
          <div className="p-4 space-y-6">
            <div className={cn(
              "relative aspect-square rounded-md overflow-hidden transition bg-muted border-2",
              mutation.isPending ? "border-primary/50" : "border-transparent",
            )}>
              <Image
                src={imageSrc}
                fill
                alt="Image"
                className={cn(
                  "object-cover transition-all duration-300",
                  mutation.isPending && "blur-sm opacity-50"
                )}
              />
              {mutation.isPending && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Loader2 className="size-12 text-white animate-spin mb-3" />
                  <p className="text-white text-sm font-medium">Processing...</p>
                  <p className="text-white/80 text-xs mt-1">This may take a moment</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button
                disabled={mutation.isPending}
                onClick={onClick}
                className="w-full"
                size="lg"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Removing Background...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Remove Background
                  </>
                )}
              </Button>

              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="flex items-start gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>This process runs entirely in your browser - no data is sent to any server</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>Processing may take 10-30 seconds depending on image size</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-primary shrink-0">•</span>
                  <span>The result will be added as a new image on your canvas</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
