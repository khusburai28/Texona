"use client";

import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-6 py-3 shrink-0 bg-card/80 backdrop-blur-sm z-20">
      <div className="flex items-center gap-4 text-foreground">
        <Link href="/" className="flex items-center gap-2 hover:opacity-75 transition">
          <div className="relative h-8 w-32">
            <Image src="/logo.png" alt="Texona" fill className="object-contain" />
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-9">
        <Link className="text-foreground text-sm font-medium leading-normal" href="/">
          Dashboard
        </Link>
        <Link className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium leading-normal" href="/#projects">
          My Projects
        </Link>
        <button
          onClick={() => {
            window.location.hash = "templates";
          }}
          className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium leading-normal"
        >
          Templates
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-accent text-foreground hover:bg-accent/80 transition-colors text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="truncate">Save</span>
          </button>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="truncate">Export</span>
          </button>
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-accent text-foreground hover:bg-accent/80 transition-colors gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gradient-to-br from-purple-500 to-pink-500" />
      </div>
    </header>
  );
};
