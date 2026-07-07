"use client";

import { RefreshCwIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { impexKeys } from "@/hooks/impex/use-impex-activities";

export function ImpexRefreshButton() {
  const queryClient = useQueryClient();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => queryClient.invalidateQueries({ queryKey: impexKeys.all })}
    >
      <RefreshCwIcon className="mr-1.5 size-4" />
      Refresh
    </Button>
  );
}
