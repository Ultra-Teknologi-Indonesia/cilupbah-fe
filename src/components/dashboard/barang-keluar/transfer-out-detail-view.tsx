"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useRouter } from "next/navigation";
import {
  DownloadIcon,
  PrinterIcon,
  CheckIcon,
  TruckIcon,
  XIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { PageTitle } from "@/components/dashboard/page-title";
import { StatusTimeline } from "@/components/dashboard/shared/status-timeline";
import { UserSelect } from "@/components/dashboard/shared/user-select";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { InfoField } from "@/components/dashboard/shared/info-field";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import {
  useOutboundTransferDetail,
  useApproveTransfer,
  useShipTransfer,
  useCancelTransfer,
  useDeleteTransfer,
} from "@/hooks/barang-keluar/use-outbound-transfers";
import { exportCsv } from "@/lib/export-csv";
import { useState, useCallback } from "react";
import { formatDate } from "@/lib/format";

const TRANSFER_STEPS = ["DRAFT", "APPROVED", "IN_TRANSIT", "RECEIVED"];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <InfoField label={label} value={value} />;
}

export function TransferOutDetailView({ transferId }: { transferId: string }) {
  const router = useRouter();
  const { data: transfer, isLoading } = useOutboundTransferDetail(transferId);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approvedBy, setApprovedBy] = useState("");
  const approveMutation = useApproveTransfer();

  const [shipOpen, setShipOpen] = useState(false);
  const [shippedBy, setShippedBy] = useState("");
  const shipMutation = useShipTransfer();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelledBy, setCancelledBy] = useState("");
  const cancelMutation = useCancelTransfer();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteTransfer();

  const handleExport = useCallback(() => {
    if (!transfer?.items?.length) return;
    exportCsv(
      `transfer-${transfer.transfer_number}.csv`,
      ["SKU", "Nama Produk", "Qty", "Qty Diterima"],
      transfer.items.map((i) => [
        i.variant?.sku ?? "",
        i.variant?.item_name ?? "",
        String(i.qty),
        String(i.received_qty ?? 0),
      ]),
    );
  }, [transfer]);

  const handlePrint = useCallback(() => window.print(), []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <p className="text-sm font-medium">Transfer tidak ditemukan</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/barang-keluar")}
        >
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={transfer.transfer_number}
        description="Detail transfer keluar"
        backHref="/dashboard/barang-keluar"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gudang" },
          { label: "Barang Keluar", href: "/dashboard/barang-keluar" },
          { label: transfer.transfer_number },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={handlePrint}
            >
              <PrinterIcon className="mr-1.5 h-4 w-4" />
              Print
            </Button>

            {transfer.status === "DRAFT" && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setApproveOpen(true);
                    setApprovedBy("");
                  }}
                >
                  <CheckIcon className="mr-1.5 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2Icon className="mr-1.5 h-4 w-4" />
                  Hapus
                </Button>
              </>
            )}

            {transfer.status === "APPROVED" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShipOpen(true);
                  setShippedBy("");
                }}
              >
                <TruckIcon className="mr-1.5 h-4 w-4" />
                Kirim
              </Button>
            )}

            {(transfer.status === "DRAFT" ||
              transfer.status === "APPROVED") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCancelOpen(true);
                  setCancelReason("");
                  setCancelledBy("");
                }}
                className="text-warning hover:bg-warning/10"
              >
                <XIcon className="mr-1.5 h-4 w-4" />
                Batalkan
              </Button>
            )}
          </>
        }
      />

      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="px-4 py-5 sm:px-6">
          <SectionTitle className="mb-4">
            Status Transfer
          </SectionTitle>
          <StatusTimeline
            domain="inventory-transfer"
            steps={TRANSFER_STEPS}
            currentStatus={transfer.status}
          />
        </div>
      </LiquidGlass>

      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="px-4 py-5 sm:px-6">
          <SectionTitle className="mb-4">
            Informasi Transfer
          </SectionTitle>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            <InfoRow label="No. Transfer" value={transfer.transfer_number} />
            <InfoRow
              label="Lokasi Asal"
              value={transfer.source_location?.location_name}
            />
            <InfoRow
              label="Lokasi Tujuan"
              value={transfer.destination_location?.location_name}
            />
            <InfoRow
              label="Status"
              value={
                <StatusBadge
                  domain="inventory-transfer"
                  status={transfer.status}
                  className="text-xs leading-tight"
                />
              }
            />
            <InfoRow label="Dibuat oleh" value={transfer.created_by} />
            <InfoRow
              label="Tgl. Dibuat"
              value={formatDate(transfer.created_at)}
            />
            {transfer.approved_by && (
              <InfoRow label="Disetujui oleh" value={transfer.approved_by} />
            )}
            {transfer.approved_at && (
              <InfoRow
                label="Tgl. Approve"
                value={formatDate(transfer.approved_at)}
              />
            )}
            {transfer.assigned_to && (
              <InfoRow label="Petugas" value={transfer.assigned_to} />
            )}
            {transfer.shipped_at && (
              <InfoRow
                label="Tgl. Kirim"
                value={formatDate(transfer.shipped_at)}
              />
            )}
            {transfer.received_by && (
              <InfoRow label="Diterima oleh" value={transfer.received_by} />
            )}
            {transfer.received_at && (
              <InfoRow
                label="Tgl. Diterima"
                value={formatDate(transfer.received_at)}
              />
            )}
            {transfer.notes && (
              <InfoRow label="Catatan" value={transfer.notes} />
            )}
          </div>
        </div>
      </LiquidGlass>

      <LiquidGlass
        radius={20}
        intensity="subtle"
        className="bg-white/30 dark:bg-white/[0.04]"
      >
        <div className="px-4 py-5 sm:px-6">
          <SectionTitle className="mb-4">
            Item Transfer
          </SectionTitle>
          {transfer.items?.length > 0 ? (
            <Table containerClassName="rounded-lg border border-border/40">
              <TableHeader>
                <TableRow className="border-b border-border/60 bg-muted/30">
                  {["SKU", "Nama Produk", "Qty", "Qty Diterima"].map((h) => (
                    <TableHead
                      key={h}
                      className="px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b border-border/20 last:border-0"
                  >
                    <TableCell className="px-3 py-3 font-mono text-xs">
                      {item.variant?.sku ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-3">
                      {item.variant?.item_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-3 tabular-nums">
                      {item.qty}
                    </TableCell>
                    <TableCell className="px-3 py-3 tabular-nums text-muted-foreground">
                      {item.received_qty ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState title="Belum ada item" />
          )}
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Transfer"
        description={`Approve transfer ${transfer.transfer_number}?`}
        confirmLabel="Approve"
        loading={approveMutation.isPending}
        onConfirm={() => {
          if (!approvedBy.trim()) return;
          approveMutation.mutate(
            { id: transfer.id, data: { approved_by: approvedBy.trim() } },
            { onSuccess: () => setApproveOpen(false) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="detail-approved-by" className="text-sm font-medium">
            Disetujui oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={approvedBy}
            onChange={setApprovedBy}
            placeholder="Nama penyetuju"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={shipOpen}
        onOpenChange={setShipOpen}
        title="Kirim Transfer"
        description={`Kirim transfer ${transfer.transfer_number}? Stok akan dikurangi dari lokasi asal.`}
        confirmLabel="Kirim"
        loading={shipMutation.isPending}
        onConfirm={() => {
          if (!shippedBy.trim()) return;
          shipMutation.mutate(
            { id: transfer.id, data: { shipped_by: shippedBy.trim() } },
            { onSuccess: () => setShipOpen(false) },
          );
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="detail-shipped-by" className="text-sm font-medium">
            Dikirim oleh <span className="text-destructive">*</span>
          </Label>
          <UserSelect
            value={shippedBy}
            onChange={setShippedBy}
            defaultToSelf
            placeholder="Nama pengirim"
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Batalkan Transfer"
        description={`Batalkan transfer ${transfer.transfer_number}?`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelledBy.trim()) return;
          cancelMutation.mutate(
            {
              id: transfer.id,
              data: {
                cancelled_by: cancelledBy.trim(),
                cancel_reason: cancelReason.trim() || undefined,
              },
            },
            { onSuccess: () => setCancelOpen(false) },
          );
        }}
      >
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <Label
              htmlFor="detail-cancelled-by"
              className="text-sm font-medium"
            >
              Dibatalkan oleh <span className="text-destructive">*</span>
            </Label>
            <UserSelect
              value={cancelledBy}
              onChange={setCancelledBy}
              defaultToSelf
              placeholder="Nama pembatal"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label
              htmlFor="detail-cancel-reason"
              className="text-sm font-medium"
            >
              Alasan pembatalan
            </Label>
            <Input
              id="detail-cancel-reason"
              placeholder="Alasan (opsional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Transfer"
        description={`Hapus draft transfer ${transfer.transfer_number}? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(transfer.id, {
            onSuccess: () => {
              setDeleteOpen(false);
              router.push("/dashboard/barang-keluar");
            },
          });
        }}
      />

      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          nav,
          header,
          aside,
          footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
