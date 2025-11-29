"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PlusCircle,
  Image as ImageIcon,
  FileText,
  Presentation,
  Instagram,
  Facebook,
  Linkedin,
  Loader2
} from "lucide-react";

import { useCreateProject } from "@/features/projects/api/use-create-project";
import { Button } from "@/components/ui/button";

const presets = [
  {
    id: "custom",
    name: "Custom Size",
    icon: PlusCircle,
    width: 900,
    height: 1200,
  },
  {
    id: "instagram-post",
    name: "Instagram Post",
    icon: Instagram,
    width: 1080,
    height: 1080,
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    icon: ImageIcon,
    width: 1080,
    height: 1920,
  },
  {
    id: "facebook-post",
    name: "Facebook Post",
    icon: Facebook,
    width: 1200,
    height: 630,
  },
  {
    id: "facebook-cover",
    name: "Facebook Cover",
    icon: Facebook,
    width: 820,
    height: 312,
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    icon: Linkedin,
    width: 1200,
    height: 627,
  },
  {
    id: "linkedin-banner",
    name: "LinkedIn Banner",
    icon: Linkedin,
    width: 1584,
    height: 396,
  },
  {
    id: "presentation",
    name: "Presentation",
    icon: Presentation,
    width: 1920,
    height: 1080,
  },
  {
    id: "document",
    name: "Document",
    icon: FileText,
    width: 816,
    height: 1056,
  },
];

export const QuickActions = () => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const mutation = useCreateProject();

  const onClick = (preset: typeof presets[0]) => {
    setLoadingId(preset.id);
    mutation.mutate(
      {
        name: `Untitled ${preset.name}`,
        json: "",
        width: preset.width,
        height: preset.height,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
        onError: () => {
          setLoadingId(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Quick start</h3>
      <div className="flex flex-wrap gap-3">
        {presets.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            className="h-auto py-4 px-6 flex flex-col items-center gap-2 hover:border-primary/50 hover:bg-accent"
            onClick={() => onClick(preset)}
            disabled={mutation.isPending}
          >
            {loadingId === preset.id ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <preset.icon className="size-5" />
            )}
            <span className="text-xs">{preset.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {preset.width} x {preset.height}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
