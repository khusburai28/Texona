import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/">
      <div className="flex items-center hover:opacity-75 transition h-[68px] px-4">
        <div className="relative h-8 w-32 rounded-md overflow-hidden bg-[hsl(222,47%,11%)]">
          <Image src="/logo.png" alt="Texona" fill className="object-contain" />
        </div>
      </div>
    </Link>
  );
};
