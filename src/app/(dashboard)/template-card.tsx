import Image from "next/image";
import { Crown, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface TemplateCardProps {
  imageSrc: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  description: string;
  width: number;
  height: number;
  isPro: boolean | null;
  onDelete?: (e: React.MouseEvent) => void;
};

export const TemplateCard = ({
  imageSrc,
  title,
  onClick,
  disabled,
  description,
  height,
  width,
  isPro,
  onDelete
}: TemplateCardProps) => {
  return (
    <div className="space-y-3 group text-left transition flex flex-col relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "w-full",
          disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"
        )}
      >
        <div
          style={{ aspectRatio: `${width}/${height}` }}
          className="relative rounded-xl w-full overflow-hidden border border-border bg-muted"
        >
          {imageSrc ? (
            <Image
              fill
              src={imageSrc}
              alt={title}
              className="object-cover transition transform group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <svg className="w-12 h-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {isPro && (
            <div className="absolute top-2 right-2 h-10 w-10 flex items-center justify-center bg-black/50 rounded-full z-10">
              <Crown className="size-5 fill-yellow-500 text-yellow-500" />
            </div>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="absolute top-2 left-2 h-8 w-8 flex items-center justify-center bg-red-500/80 hover:bg-red-600 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="size-4 text-white" />
            </button>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl backdrop-filter backdrop-blur-sm">
            <p className="text-white font-medium">
              Open in editor
            </p>
          </div>
        </div>
      </button>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}