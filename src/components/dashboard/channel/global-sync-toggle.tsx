"use client";

import { useState } from "react";
import { RefreshCwIcon, Loader2Icon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { cn } from "@/lib/utils";
import {
  useChannelSyncSetting,
  useSetChannelSyncSetting,
} from "@/hooks/channel/use-channel-sync-setting";

export function GlobalSyncToggle({ className }: { className?: string }) {
  const { data: enabled, isLoading } = useChannelSyncSetting();
  const setSync = useSetChannelSyncSetting();
  const [confirmPause, setConfirmPause] = useState(false);

  const isOn = enabled ?? true;
  const pending = isLoading || setSync.isPending;

  const handleChange = (checked: boolean) => {
    if (!checked) {
      setConfirmPause(true);
      return;
    }
    setSync.mutate(true);
  };

  return (
    <LiquidGlass
      radius={20}
      intensity="subtle"
      className={cn("bg-white/30 dark:bg-white/[0.04]", className)}
    >
      <div className="flex items-center gap-4 px-4 py-3 sm:px-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/60">
          <RefreshCwIcon className="size-5 text-muted-foreground" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Sinkronisasi Channel
            </span>
            {!isLoading && (
              <span
                className={cn(
                  "text-xs font-medium",
                  isOn ? "text-success" : "text-warning",
                )}
              >
                {isOn ? "Aktif" : "Dijeda"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Master global untuk semua toko & channel. Saat dijeda, seluruh
            sinkronisasi stok, harga, produk, dan pesanan berhenti sementara
            tanpa mengubah pengaturan sync per-produk.
          </p>
        </div>
        {pending ? (
          <Loader2Icon className="size-5 shrink-0 animate-spin text-primary" />
        ) : (
          <Switch
            checked={isOn}
            onCheckedChange={handleChange}
            aria-label="Sinkronisasi channel global"
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmPause}
        onOpenChange={(o) => !o && setConfirmPause(false)}
        title="Jeda Sinkronisasi Channel"
        description="Menghentikan SEMUA sinkronisasi (stok, harga, produk, pesanan) untuk seluruh toko & channel. Pesanan yang masuk selama jeda otomatis ditarik saat sync dinyalakan lagi, dan pengaturan sync per-produk tetap tersimpan. Lanjutkan?"
        confirmLabel="Jeda sync"
        variant="destructive"
        loading={setSync.isPending}
        onConfirm={() =>
          setSync.mutate(false, { onSuccess: () => setConfirmPause(false) })
        }
      />
    </LiquidGlass>
  );
}
