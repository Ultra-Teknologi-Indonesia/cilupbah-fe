"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { usePermissions } from "@/hooks/auth/use-permissions";
import { useLandingRoute } from "@/hooks/auth/use-landing-route";
import { permissionForPath } from "@/components/dashboard/sidebar/nav-data";
import {
  PageHeaderSkeleton,
  CardGridSkeleton,
} from "@/components/ui/page-skeleton";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAny, isLoading } = usePermissions();
  const landing = useLandingRoute();

  const required = permissionForPath(pathname);
  const allowed =
    !required || canAny(Array.isArray(required) ? required : [required]);

  useEffect(() => {
    if (!isLoading && !allowed && pathname !== landing) {
      router.replace(landing);
    }
  }, [isLoading, allowed, pathname, landing, router]);

  if (required && (isLoading || !allowed)) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={4} />
      </div>
    );
  }

  return <>{children}</>;
}
