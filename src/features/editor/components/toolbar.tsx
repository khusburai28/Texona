import { useState, useEffect } from "react";
import { toast } from "sonner";

import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline
} from "react-icons/fa";
import { TbColorFilter } from "react-icons/tb";
import { BsBorderWidth } from "react-icons/bs";
import { RxTransparencyGrid } from "react-icons/rx";
import {
  ArrowUp,
  ArrowDown,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash,
  SquareSplitHorizontal,
  Copy,
  Sparkles,
  Settings
} from "lucide-react";

import { isTextType } from "@/features/editor/utils";
import { FontSizeInput } from "@/features/editor/components/font-size-input";
import { 
  ActiveTool, 
  Editor, 
  FONT_SIZE, 
  FONT_WEIGHT
} from "@/features/editor/types";

import { cn } from "@/lib/utils";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAestheticScore } from "@/features/ai/api/use-aesthetic-score";

interface ToolbarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
};

const DEFAULT_DESIGN_RULES = `Design Evaluation Criteria (100 points total):

1. Visual Balance & Composition (25 points)
   - Elements are well-distributed across the canvas
   - Proper use of symmetry or asymmetry
   - Clear visual hierarchy
   - Focal points are effectively established

2. Color Harmony & Contrast (25 points)
   - Color palette is cohesive and intentional
   - Sufficient contrast for readability
   - Colors evoke appropriate emotions for the design purpose
   - No clashing or jarring color combinations

3. Typography & Readability (20 points)
   - Font choices are appropriate and professional
   - Text is easily readable at intended viewing distance
   - Proper font pairing (max 2-3 font families)
   - Appropriate font sizes and line spacing
   - Good text-to-background contrast

4. White Space & Layout (15 points)
   - Effective use of negative space
   - Not overcrowded or cluttered
   - Proper margins and padding
   - Elements have room to breathe

5. Overall Visual Appeal & Impact (15 points)
   - Design is aesthetically pleasing
   - Creates desired emotional response
   - Memorable and distinctive
   - Professional execution

Provide constructive feedback focusing on both strengths and specific, actionable improvements.`;

export const Toolbar = ({
  editor,
  activeTool,
  onChangeActiveTool,
}: ToolbarProps) => {
  const initialFillColor = editor?.getActiveFillColor();
  const initialStrokeColor = editor?.getActiveStrokeColor();
  const initialFontFamily = editor?.getActiveFontFamily();
  const initialFontWeight = editor?.getActiveFontWeight() || FONT_WEIGHT;
  const initialFontStyle = editor?.getActiveFontStyle();
  const initialFontLinethrough = editor?.getActiveFontLinethrough();
  const initialFontUnderline = editor?.getActiveFontUnderline();
  const initialTextAlign = editor?.getActiveTextAlign();
  const initialFontSize = editor?.getActiveFontSize() || FONT_SIZE

  const [properties, setProperties] = useState({
    fillColor: initialFillColor,
    strokeColor: initialStrokeColor,
    fontFamily: initialFontFamily,
    fontWeight: initialFontWeight,
    fontStyle: initialFontStyle,
    fontLinethrough: initialFontLinethrough,
    fontUnderline: initialFontUnderline,
    textAlign: initialTextAlign,
    fontSize: initialFontSize,
  });

  const [showAestheticScore, setShowAestheticScore] = useState(false);
  const [aestheticData, setAestheticData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [designRules, setDesignRules] = useState(DEFAULT_DESIGN_RULES);
  const [tempDesignRules, setTempDesignRules] = useState(DEFAULT_DESIGN_RULES);

  const aestheticScoreMutation = useAestheticScore();

  // Load design rules from localStorage on mount
  useEffect(() => {
    const savedRules = localStorage.getItem('aesthetic-design-rules');
    if (savedRules) {
      setDesignRules(savedRules);
      setTempDesignRules(savedRules);
    }
  }, []);

  const selectedObject = editor?.selectedObjects[0];
  const selectedObjectType = editor?.selectedObjects[0]?.type;

  const isText = isTextType(selectedObjectType);
  const isImage = selectedObjectType === "image";

  const onChangeFontSize = (value: number) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeFontSize(value);
    setProperties((current) => ({
      ...current,
      fontSize: value,
    }));
  };

  const onChangeTextAlign = (value: string) => {
    if (!selectedObject) {
      return;
    }

    editor?.changeTextAlign(value);
    setProperties((current) => ({
      ...current,
      textAlign: value,
    }));
  };

  const toggleBold = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontWeight > 500 ? 500 : 700;

    editor?.changeFontWeight(newValue);
    setProperties((current) => ({
      ...current,
      fontWeight: newValue,
    }));
  };

  const toggleItalic = () => {
    if (!selectedObject) {
      return;
    }

    const isItalic = properties.fontStyle === "italic";
    const newValue = isItalic ? "normal" : "italic";

    editor?.changeFontStyle(newValue);
    setProperties((current) => ({
      ...current,
      fontStyle: newValue,
    }));
  };

  const toggleLinethrough = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontLinethrough ? false : true;

    editor?.changeFontLinethrough(newValue);
    setProperties((current) => ({
      ...current,
      fontLinethrough: newValue,
    }));
  };

  const toggleUnderline = () => {
    if (!selectedObject) {
      return;
    }

    const newValue = properties.fontUnderline ? false : true;

    editor?.changeFontUnderline(newValue);
    setProperties((current) => ({
      ...current,
      fontUnderline: newValue,
    }));
  };

  const handleSaveSettings = () => {
    setDesignRules(tempDesignRules);
    localStorage.setItem('aesthetic-design-rules', tempDesignRules);
    setShowSettings(false);
    toast.success("Design rules saved successfully");
  };

  const handleResetToDefault = () => {
    setTempDesignRules(DEFAULT_DESIGN_RULES);
  };

  const handleOpenSettings = () => {
    setTempDesignRules(designRules);
    setShowSettings(true);
  };

  const checkAestheticScore = async () => {
    if (!editor) {
      toast.error("Editor not ready");
      return;
    }

    try {
      const workspace = editor.getWorkspace();

      if (!workspace) {
        toast.error("No canvas workspace found");
        return;
      }

      toast.loading("Analyzing design aesthetics...");

      // Export canvas as PNG data URL
      const dataUrl = editor.canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
        left: workspace.left || 0,
        top: workspace.top || 0,
        width: workspace.width || 900,
        height: workspace.height || 1200,
      });

      const result = await aestheticScoreMutation.mutateAsync({
        image: dataUrl,
        designRules: designRules,
      });

      toast.dismiss();
      setAestheticData(result.data);
      setShowAestheticScore(true);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to calculate aesthetic score");
      console.error("Aesthetic score error:", error);
    }
  };

  if (editor?.selectedObjects.length === 0) {
    return (
      <>
        <div className="shrink-0 h-[56px] border-b bg-card w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
          <div className="ml-auto flex items-center gap-x-2">
            <Hint label="Design Rules Settings" side="bottom" sideOffset={5}>
              <Button
                onClick={handleOpenSettings}
                variant="ghost"
                size="icon"
              >
                <Settings className="size-4" />
              </Button>
            </Hint>
            <Hint label="Check Aesthetic Score" side="bottom" sideOffset={5}>
              <Button
                onClick={checkAestheticScore}
                disabled={aestheticScoreMutation.isPending}
                variant="ghost"
                size="sm"
                className="gap-x-2"
              >
                <Sparkles className="size-4" />
                Check Aesthetic Score
              </Button>
            </Hint>
          </div>
        </div>
        <Dialog open={showAestheticScore} onOpenChange={setShowAestheticScore}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-x-2">
                <Sparkles className="size-5" />
                Aesthetic Score Analysis
              </DialogTitle>
              <DialogDescription>
                AI-powered design evaluation by Texona
              </DialogDescription>
            </DialogHeader>
            {aestheticData && (
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="text-6xl font-bold text-primary">
                      {aestheticData.score}
                    </div>
                    <div className="text-sm text-muted-foreground text-center">
                      out of 100
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Score Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Visual Balance & Composition:</span>
                      <span className="font-medium">{aestheticData.breakdown.balance}/25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Color Harmony & Contrast:</span>
                      <span className="font-medium">{aestheticData.breakdown.color}/25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Typography & Readability:</span>
                      <span className="font-medium">{aestheticData.breakdown.typography}/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>White Space & Layout:</span>
                      <span className="font-medium">{aestheticData.breakdown.layout}/15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overall Visual Appeal:</span>
                      <span className="font-medium">{aestheticData.breakdown.appeal}/15</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Summary</h3>
                  <p className="text-sm text-muted-foreground">{aestheticData.summary}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Strengths</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {aestheticData.strengths.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Suggestions for Improvement</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {aestheticData.improvements.map((improvement: string, index: number) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-x-2">
                <Settings className="size-5" />
                Design Rules Settings
              </DialogTitle>
              <DialogDescription>
                Customize the criteria used to evaluate your designs. These rules will be used by Texona to analyze your work.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="design-rules">Design Evaluation Criteria</Label>
                <Textarea
                  id="design-rules"
                  value={tempDesignRules}
                  onChange={(e) => setTempDesignRules(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter your design evaluation criteria..."
                />
                <p className="text-xs text-muted-foreground">
                  Define the criteria and scoring system for evaluating designs. Be specific about what makes a good design.
                </p>
              </div>
            </div>
            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                onClick={handleResetToDefault}
                type="button"
              >
                Reset to Default
              </Button>
              <div className="flex gap-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowSettings(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSettings}
                  type="button"
                >
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="shrink-0 h-[56px] border-b bg-card w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
      {!isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Color" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("fill")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "fill" && "bg-accent"
              )}
            >
              <div
                className="rounded-sm size-4 border"
                style={{ backgroundColor: properties.fillColor }}
              />
            </Button>
          </Hint>
        </div>
      )}
      {!isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Stroke color" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("stroke-color")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "stroke-color" && "bg-accent"
              )}
            >
              <div
                className="rounded-sm size-4 border-2 bg-card"
                style={{ borderColor: properties.strokeColor }}
              />
            </Button>
          </Hint>
        </div>
      )}
      {!isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Stroke width" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("stroke-width")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "stroke-width" && "bg-accent"
              )}
            >
              <BsBorderWidth className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Font" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("font")}
              size="icon"
              variant="ghost"
              className={cn(
                "w-auto px-2 text-sm",
                activeTool === "font" && "bg-accent"
              )}
            >
              <div className="max-w-[100px] truncate">
                {properties.fontFamily}
              </div>
              <ChevronDown className="size-4 ml-2 shrink-0" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Bold" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleBold}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontWeight > 500 && "bg-accent"
              )}
            >
              <FaBold className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Italic" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleItalic}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontStyle === "italic" && "bg-accent"
              )}
            >
              <FaItalic className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Underline" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleUnderline}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontUnderline && "bg-accent"
              )}
            >
              <FaUnderline className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Strike" side="bottom" sideOffset={5}>
            <Button
              onClick={toggleLinethrough}
              size="icon"
              variant="ghost"
              className={cn(
                properties.fontLinethrough && "bg-accent"
              )}
            >
              <FaStrikethrough className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Align left" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("left")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textAlign === "left" && "bg-accent"
              )}
            >
              <AlignLeft className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Align center" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("center")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textAlign === "center" && "bg-accent"
              )}
            >
              <AlignCenter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Align right" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeTextAlign("right")}
              size="icon"
              variant="ghost"
              className={cn(
                properties.textAlign === "right" && "bg-accent"
              )}
            >
              <AlignRight className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isText && (
        <div className="flex items-center h-full justify-center">
         <FontSizeInput
            value={properties.fontSize}
            onChange={onChangeFontSize}
         />
        </div>
      )}
      {isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Filters" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("filter")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "filter" && "bg-accent"
              )}
            >
              <TbColorFilter className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      {isImage && (
        <div className="flex items-center h-full justify-center">
          <Hint label="Remove background" side="bottom" sideOffset={5}>
            <Button
              onClick={() => onChangeActiveTool("remove-bg")}
              size="icon"
              variant="ghost"
              className={cn(
                activeTool === "remove-bg" && "bg-accent"
              )}
            >
              <SquareSplitHorizontal className="size-4" />
            </Button>
          </Hint>
        </div>
      )}
      <div className="flex items-center h-full justify-center">
        <Hint label="Bring forward" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.bringForward()}
            size="icon"
            variant="ghost"
          >
            <ArrowUp className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label="Send backwards" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.sendBackwards()}
            size="icon"
            variant="ghost"
          >
            <ArrowDown className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label="Opacity" side="bottom" sideOffset={5}>
          <Button
            onClick={() => onChangeActiveTool("opacity")}
            size="icon"
            variant="ghost"
            className={cn(activeTool === "opacity" && "bg-accent")}
          >
            <RxTransparencyGrid className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label="Duplicate" side="bottom" sideOffset={5}>
          <Button
            onClick={() => {
              editor?.onCopy();
              editor?.onPaste();
            }}
            size="icon"
            variant="ghost"
          >
            <Copy className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="flex items-center h-full justify-center">
        <Hint label="Delete" side="bottom" sideOffset={5}>
          <Button
            onClick={() => editor?.delete()}
            size="icon"
            variant="ghost"
            className="text-red-600"
          >
            <Trash className="size-4" />
          </Button>
        </Hint>
      </div>
      <div className="ml-auto flex items-center gap-x-2">
        <Hint label="Design Rules Settings" side="bottom" sideOffset={5}>
          <Button
            onClick={handleOpenSettings}
            variant="ghost"
            size="icon"
          >
            <Settings className="size-4" />
          </Button>
        </Hint>
        <Hint label="Check Aesthetic Score" side="bottom" sideOffset={5}>
          <Button
            onClick={checkAestheticScore}
            disabled={aestheticScoreMutation.isPending}
            variant="ghost"
            size="sm"
            className="gap-x-2"
          >
            <Sparkles className="size-4" />
            Check Aesthetic Score
          </Button>
        </Hint>
      </div>
      <Dialog open={showAestheticScore} onOpenChange={setShowAestheticScore}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              <Sparkles className="size-5" />
              Aesthetic Score Analysis
            </DialogTitle>
            <DialogDescription>
              AI-powered design evaluation by Texona
            </DialogDescription>
          </DialogHeader>
          {aestheticData && (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="text-6xl font-bold text-primary">
                    {aestheticData.score}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    out of 100
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Score Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Visual Balance & Composition:</span>
                    <span className="font-medium">{aestheticData.breakdown.balance}/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color Harmony & Contrast:</span>
                    <span className="font-medium">{aestheticData.breakdown.color}/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Typography & Readability:</span>
                    <span className="font-medium">{aestheticData.breakdown.typography}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>White Space & Layout:</span>
                    <span className="font-medium">{aestheticData.breakdown.layout}/15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Visual Appeal:</span>
                    <span className="font-medium">{aestheticData.breakdown.appeal}/15</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Summary</h3>
                <p className="text-sm text-muted-foreground">{aestheticData.summary}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Strengths</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {aestheticData.strengths.map((strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Suggestions for Improvement</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {aestheticData.improvements.map((improvement: string, index: number) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-x-2">
              <Settings className="size-5" />
              Design Rules Settings
            </DialogTitle>
            <DialogDescription>
              Customize the criteria used to evaluate your designs. These rules will be used by Texona to analyze your work.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="design-rules">Design Evaluation Criteria</Label>
              <Textarea
                id="design-rules"
                value={tempDesignRules}
                onChange={(e) => setTempDesignRules(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Enter your design evaluation criteria..."
              />
              <p className="text-xs text-muted-foreground">
                Define the criteria and scoring system for evaluating designs. Be specific about what makes a good design.
              </p>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={handleResetToDefault}
              type="button"
            >
              Reset to Default
            </Button>
            <div className="flex gap-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowSettings(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                type="button"
              >
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
