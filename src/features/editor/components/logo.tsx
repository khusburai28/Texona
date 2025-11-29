import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/">
      <div className="relative h-8 w-32 shrink-0 rounded-md overflow-hidden bg-[hsl(222,47%,11%)]">
        <Image
          src="/logo.png"
          fill
          alt="Texona"
          className="object-contain shrink-0 hover:opacity-75 transition"
        />
      </div>
    </Link>
  );
};
