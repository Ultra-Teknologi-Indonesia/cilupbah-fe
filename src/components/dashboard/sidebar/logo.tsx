import Image from "next/image";

import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <Image
    src="/logo-mark.png"
    alt="Cilupbah Superapps"
    width={28}
    height={28}
    className={cn("rounded-md object-contain", className)}
  />
);
