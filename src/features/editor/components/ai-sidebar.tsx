import { useState } from "react";
import { Wand2, ImageIcon, Loader2 } from "lucide-react";

import { ActiveTool, Editor, JSON_KEYS } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useGenerateImage } from "@/features/ai/api/use-generate-image";
import { useAiEdit } from "@/features/ai/api/use-ai-edit";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

type AiMode = "generate" | "edit";

interface AiSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

export const AiSidebar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: AiSidebarProps) => {
  const generateMutation = useGenerateImage();
  const editMutation = useAiEdit();

  const [mode, setMode] = useState<AiMode>("generate");
  const [value, setValue] = useState("");

  const isPending = generateMutation.isPending || editMutation.isPending;

  const onSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (mode === "generate") {
      generateMutation.mutate({ prompt: value }, {
        onSuccess: ({ data }) => {
          editor?.addImage(data);
        }
      });
    } else {
      // AI Edit mode
      const canvas = editor?.canvas;
      if (!canvas) return;

      const workspace = editor?.getWorkspace();
      const canvasJson = JSON.stringify(canvas.toJSON(JSON_KEYS));
      const width = workspace?.width as number || 900;
      const height = workspace?.height as number || 1200;

      editMutation.mutate({
        prompt: value,
        canvasJson,
        width,
        height
      }, {
        onSuccess: (response) => {
          if ('data' in response) {
            // Parse the response to check if clip object exists
            try {
              const data = JSON.parse(response.data);
              const hasClip = data.objects?.some((obj: any) => obj.name === "clip");

              if (!hasClip) {
                // Restore the clip object from original canvas
                const originalData = JSON.parse(canvasJson);
                const clipObject = originalData.objects?.find((obj: any) => obj.name === "clip");
                if (clipObject) {
                  data.objects = [clipObject, ...(data.objects || [])];
                }
              }

              editor?.loadJson(JSON.stringify(data));
            } catch {
              editor?.loadJson(response.data);
            }
          }
        }
      });
    }
  };

  const onClose = () => {
    onChangeActiveTool("select");
  };

  return (
    <aside
      className={cn(
        "bg-card relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "ai" ? "visible" : "hidden",
      )}
    >
      <ToolSidebarHeader
        title="AI"
        description={mode === "generate" ? "Generate an image using AI" : "Edit canvas using AI"}
      />
      <ScrollArea>
        <div className="p-4 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                mode === "generate"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ImageIcon className="size-4" />
              Generate
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                mode === "edit"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Wand2 className="size-4" />
              AI Edit
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              disabled={isPending}
              placeholder={
                mode === "generate"
                  ? "An astronaut riding a horse on mars, hd, dramatic lighting"
                  : "Change the text color to red, add a blue circle in the center, move the rectangle to the left..."
              }
              cols={30}
              rows={10}
              required
              minLength={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button
              disabled={isPending}
              type="submit"
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {mode === "generate" ? "Generating..." : "Editing..."}
                </>
              ) : (
                <>
                  {mode === "generate" ? (
                    <>
                      <ImageIcon className="size-4 mr-2" />
                      Generate Image
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-4 mr-2" />
                      Apply AI Edit
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          {mode === "edit" && (
            <div className="text-xs text-muted-foreground space-y-2 pt-2 border-t">
              <p className="font-medium">Example prompts:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Change all text to blue</li>
                <li>Add a red rectangle</li>
                <li>Make the circle bigger</li>
                <li>Delete all shapes except text</li>
                <li>Move everything to the center</li>
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
