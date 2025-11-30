import { formatDistanceToNow } from "date-fns";
import { Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  id: string;
  name: string;
  width: number;
  height: number;
  thumbnailUrl?: string | null;
  updatedAt: string;
  onClick: () => void;
  onCopy: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const ProjectCard = ({
  name,
  width,
  height,
  thumbnailUrl,
  updatedAt,
  onClick,
  onCopy,
  onDelete,
  disabled,
}: ProjectCardProps) => {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-full text-left transition",
          disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"
        )}
      >
        <div
          style={{ aspectRatio: `${width}/${height}` }}
          className="relative rounded-xl w-full overflow-hidden border border-border bg-muted hover:border-primary/50 transition-colors"
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={name}
              className="object-cover w-full h-full transition transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <svg className="w-16 h-16 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Hover overlay with actions */}
          <div className="opacity-0 group-hover:opacity-100 transition absolute inset-0 bg-black/60 flex items-center justify-center gap-2 rounded-xl">
            <button
              onClick={onCopy}
              className="h-10 w-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full transition-all hover:scale-110"
              title="Make a copy"
            >
              <Copy className="size-5 text-gray-900" />
            </button>
            <button
              onClick={onDelete}
              className="h-10 w-10 flex items-center justify-center bg-red-500/90 hover:bg-red-600 rounded-full transition-all hover:scale-110"
              title="Delete project"
            >
              <Trash2 className="size-5 text-white" />
            </button>
          </div>
        </div>
      </button>

      {/* Project info */}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium truncate">
          {name}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{width} × {height} px</span>
          <span>{formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
};
