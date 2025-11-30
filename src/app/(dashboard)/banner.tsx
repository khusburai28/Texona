"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles, Zap, Star } from "lucide-react";
import { toast } from "sonner";

import { useCreateProject } from "@/features/projects/api/use-create-project";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Banner = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const mutation = useCreateProject();

  const onClick = () => {
    setLoading(true);
    toast.loading("Creating project...");
    mutation.mutate(
      {
        name: "Untitled project",
        json: "",
        width: 900,
        height: 1200,
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/editor/${data.id}`);
        },
      }
    );
  };

  return (
    <div className="relative overflow-hidden text-white min-h-[280px] flex gap-x-6 p-8 items-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#06b6d4]">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Floating icons */}
      <div className="absolute top-6 right-12 hidden lg:block">
        <Star className="size-6 text-yellow-300 fill-yellow-300 animate-pulse" />
      </div>
      <div className="absolute bottom-8 right-24 hidden lg:block">
        <Zap className="size-5 text-cyan-300 fill-cyan-300" />
      </div>

      <div className="relative rounded-full size-32 items-center justify-center bg-white/10 backdrop-blur-sm hidden md:flex">
        <div className="rounded-full size-24 flex items-center justify-center bg-white/20 backdrop-blur-sm">
          <Sparkles className="size-12 text-white fill-white/50" />
        </div>
      </div>
      <div className="relative flex flex-col gap-y-3 flex-1">
        <div className="inline-flex items-center gap-2 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 w-fit">
          <Zap className="size-3" />
          AI-Powered Design
        </div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
          Visualize your ideas with Texona
        </h1>
        <p className="text-sm md:text-base text-white/80 max-w-md">
          Transform your creative vision into stunning designs. AI-powered tools make it effortless.
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            disabled={mutation.isPending}
            onClick={onClick}
            className="bg-white text-blue-600 hover:bg-white/90"
          >
            Start creating
            {loading ? (
              <Loader2 className="size-4 ml-2 animate-spin" />
            ) : (
              <ArrowRight className="size-4 ml-2" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
