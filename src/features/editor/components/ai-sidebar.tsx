import { useState, useEffect } from "react";
import { Wand2, ImageIcon, Loader2, Key, Settings2 } from "lucide-react";

import { ActiveTool, Editor, JSON_KEYS } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useGenerateImage } from "@/features/ai/api/use-generate-image";
import { useAiEdit } from "@/features/ai/api/use-ai-edit";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type AiMode = "generate" | "edit";
type AspectRatio = "16:9" | "1:1" | "21:9" | "2:3" | "3:2" | "4:5" | "5:4" | "9:16" | "9:21";

const STORAGE_KEY = "stability-ai-api-key";

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
  const [negativePrompt, setNegativePrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem(STORAGE_KEY, newKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isPending = generateMutation.isPending || editMutation.isPending;

  const onSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (mode === "generate") {
      generateMutation.mutate({
        prompt: value,
        negativePrompt: negativePrompt || undefined,
        apiKey: apiKey || undefined,
        aspectRatio: aspectRatio,
      }, {
        onSuccess: (response) => {
          if ('data' in response) {
            editor?.addImage(response.data);
          }
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
            {/* API Key Field */}
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="flex items-center gap-2 text-xs">
                <Key className="size-3" />
                Stability AI API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://platform.stability.ai/account/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  platform.stability.ai
                </a>
              </p>
            </div>

            {/* Main Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-xs">
                {mode === "generate" ? "Prompt" : "Instruction"}
              </Label>
              <Textarea
                id="prompt"
                disabled={isPending}
                placeholder={
                  mode === "generate"
                    ? "An astronaut riding a horse on mars, hd, dramatic lighting, photorealistic"
                    : "Change the text color to red, add a blue circle in the center, move the rectangle to the left..."
                }
                rows={mode === "generate" ? 5 : 8}
                required
                minLength={3}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="text-sm resize-none"
              />
            </div>

            {/* Advanced Options - Only for Generate mode */}
            {mode === "generate" && (
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs px-0"
                  >
                    <Settings2 className="size-3" />
                    Advanced Options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  {/* Negative Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="negativePrompt" className="text-xs">
                      Negative Prompt
                    </Label>
                    <Textarea
                      id="negativePrompt"
                      disabled={isPending}
                      placeholder="ugly, blurry, low quality, distorted, deformed"
                      rows={3}
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="text-sm resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Describe what you don't want in the image
                    </p>
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <Label htmlFor="aspectRatio" className="text-xs">
                      Aspect Ratio
                    </Label>
                    <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
                      <SelectTrigger id="aspectRatio" className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                        <SelectItem value="2:3">2:3 (Portrait)</SelectItem>
                        <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                        <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                        <SelectItem value="5:4">5:4 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                        <SelectItem value="9:21">9:21 (Vertical Wide)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

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
