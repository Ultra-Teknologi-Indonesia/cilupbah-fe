"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Monitor,
  ShieldOff,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FormFooter } from "@/components/dashboard/shared/form-footer";
import {
  useChangePassword,
  useMySessions,
  useRevokeOtherSessions,
  useRevokeSession,
} from "@/hooks/auth/use-profile";
import { formatDateTime } from "@/lib/format";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/schemas/auth/change-password.schema";
import type { UserSession } from "@/types/auth/auth.types";

export function KeamananTab() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <UbahKataSandiCard />
      <SesiAktifCard />
    </div>
  );
}

function UbahKataSandiCard() {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext, setShowNext] = React.useState(false);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    mode: "onTouched",
  });

  const changePassword = useChangePassword();

  const onSubmit = (values: ChangePasswordValues) => {
    changePassword.mutate(values, {
      onSuccess: () =>
        form.reset({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        }),
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
          noValidate
        >
          <CardHeader>
            <CardTitle>Ubah Kata Sandi</CardTitle>
            <CardDescription>
              Minimal 8 karakter, memuat huruf dan angka.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Kata sandi saat ini</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      show={showCurrent}
                      onToggle={() => setShowCurrent((v) => !v)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata sandi baru</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      show={showNext}
                      onToggle={() => setShowNext((v) => !v)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi kata sandi baru</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      show={showNext}
                      onToggle={() => setShowNext((v) => !v)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <div className="px-6 pb-6">
            <FormFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  form.reset({
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                  })
                }
                disabled={changePassword.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  "Simpan kata sandi baru"
                )}
              </Button>
            </FormFooter>
          </div>
        </form>
      </Form>
    </Card>
  );
}

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  show: boolean;
  onToggle: () => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ show, onToggle, className, ...props }, ref) => (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className={`pr-10 ${className ?? ""}`.trim()}
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={show}
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  ),
);
PasswordInput.displayName = "PasswordInput";

function SesiAktifCard() {
  const sessionsQuery = useMySessions();
  const revokeSession = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();
  const [confirmOthers, setConfirmOthers] = React.useState(false);

  const sessions = sessionsQuery.data ?? [];
  const otherCount = sessions.filter((s) => !s.is_current).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Sesi Aktif</CardTitle>
          <CardDescription>
            Sesi login yang masih terpasang pada akun Anda.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmOthers(true)}
          disabled={otherCount === 0 || revokeOthers.isPending}
        >
          <ShieldOff className="size-4" />
          Keluar dari semua sesi lain
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {sessionsQuery.isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Monitor}
            title="Belum ada sesi aktif"
            description="Sesi login akan muncul di sini setelah Anda masuk."
          />
        ) : (
          sessions.map((session) => (
            <SesiRow
              key={session.id}
              session={session}
              onRevoke={() => revokeSession.mutate(session.id)}
              isRevoking={
                revokeSession.isPending &&
                revokeSession.variables === session.id
              }
            />
          ))
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmOthers}
        onOpenChange={setConfirmOthers}
        title="Keluar dari semua sesi lain?"
        description={`Semua sesi kecuali sesi ini akan dicabut (${otherCount} sesi). Anda tetap login di sini.`}
        confirmLabel="Keluarkan"
        variant="destructive"
        loading={revokeOthers.isPending}
        onConfirm={() =>
          revokeOthers.mutate(undefined, {
            onSettled: () => setConfirmOthers(false),
          })
        }
      />
    </Card>
  );
}

function SesiRow({
  session,
  onRevoke,
  isRevoking,
}: {
  session: UserSession;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const lastUsed = session.last_used_at
    ? formatDateTime(session.last_used_at)
    : "Belum pernah digunakan";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted/60">
          <Monitor className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">
              {session.name?.trim() || "Sesi"}
            </p>
            {session.is_current ? (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Sesi ini
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Terakhir aktif: {lastUsed}
          </p>
        </div>
      </div>

      {session.is_current ? (
        <span className="text-xs text-muted-foreground sm:text-right">
          Gunakan tombol Keluar untuk mengakhiri sesi ini.
        </span>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {isRevoking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Cabut sesi
        </Button>
      )}
    </div>
  );
}
