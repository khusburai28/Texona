import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Loader, Upload, Trash2, Search } from "lucide-react";
import { useRef, useState, useEffect } from "react";

import { ActiveTool, Editor } from "@/features/editor/types";
import { ToolSidebarClose } from "@/features/editor/components/tool-sidebar-close";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";

import { useGetImages } from "@/features/images/api/use-get-images";
import { useUploadImage, useGetUploadedImages, useDeleteUploadedImage } from "@/features/images/api/use-upload-image";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";

interface ImageSidebarProps {
  editor: Editor | undefined;
  activeTool: ActiveTool;
  onChangeActiveTool: (tool: ActiveTool) => void;
}

export const ImageSidebar = ({ editor, activeTool, onChangeActiveTool }: ImageSidebarProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading, isError } = useGetImages(debouncedSearch);
  const uploadedImages = useGetUploadedImages();
  const uploadMutation = useUploadImage();
  const deleteMutation = useDeleteUploadedImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Image?",
    "Are you sure you want to delete this image? This action cannot be undone."
  );

  const onClose = () => {
    onChangeActiveTool("select");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(
        { file },
        {
          onSuccess: ({ data }) => {
            editor?.addImage(data.url);
          },
        }
      );
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    const ok = await confirm();
    if (ok) {
      deleteMutation.mutate({ id: imageId });
    }
  };

  return (
    <aside
      className={cn(
        "bg-card relative border-r z-[40] w-[360px] h-full flex flex-col",
        activeTool === "images" ? "visible" : "hidden"
      )}
    >
      <ConfirmDialog />
      <ToolSidebarHeader title="Images" description="Add images to your canvas" />
      <div className="p-4 border-b space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="w-full"
          variant="outline"
        >
          <Upload className="size-4 mr-2" />
          {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search images... (e.g., nature, business, city)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      {uploadedImages.data && uploadedImages.data.length > 0 && (
        <>
          <div className="px-4 py-2 border-b">
            <p className="text-xs font-medium text-muted-foreground">Your Uploads</p>
          </div>
          <div className="p-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              {uploadedImages.data.map((image) => (
                <div key={image.id} className="relative group">
                  <button
                    onClick={() => editor?.addImage(image.url)}
                    className="relative w-full h-[100px] hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="object-cover w-full h-full"
                      loading="lazy"
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white p-1 bg-black/50 text-left">
                      {image.name}
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteImage(e, image.id)}
                    className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center bg-red-500/80 hover:bg-red-600 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {data && data.length > 0 && (
        <div className="px-4 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            {debouncedSearch ? `Results for "${debouncedSearch}"` : "Stock Images"}
          </p>
        </div>
      )}
      {isLoading && (
        <div className="flex items-center justify-center flex-1">
          <Loader className="size-4 text-muted-foreground animate-spin" />
        </div>
      )}
      {isError && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1">
          <AlertTriangle className="size-4 text-muted-foreground" />
          <p className="text-muted-foreground text-xs">Failed to fetch images</p>
        </div>
      )}
      {!isLoading && !isError && data && data.length === 0 && debouncedSearch && (
        <div className="flex flex-col gap-y-4 items-center justify-center flex-1 p-4">
          <Search className="size-8 text-muted-foreground" />
          <div className="text-center">
            <p className="text-muted-foreground text-sm font-medium">No images found</p>
            <p className="text-muted-foreground text-xs mt-1">Try searching for something else</p>
          </div>
        </div>
      )}
      <ScrollArea>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {data &&
              data.map((image) => {
                return (
                  <button
                    onClick={() => editor?.addImage(image.urls.regular)}
                    key={image.id}
                    className="relative w-full h-[100px] group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
                  >
                    <img
                      src={image?.urls?.small || image?.urls?.thumb}
                      alt={image.alt_description || "Image"}
                      className="object-cover"
                      loading="lazy"
                    />
                    <Link
                      target="_blank"
                      href={image.links.html}
                      className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 text-left"
                    >
                      {image.user.name}
                    </Link>
                  </button>
                );
              })}
          </div>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={onClose} />
    </aside>
  );
};
