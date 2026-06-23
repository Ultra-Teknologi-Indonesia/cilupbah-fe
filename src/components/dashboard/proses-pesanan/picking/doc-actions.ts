import { toast } from "sonner"

import { OutboundService } from "@/services/proses-pesanan/outbound.service"
import { printReport } from "@/lib/proses-pesanan/print"

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string" && m) return m
  }
  return fallback
}

async function run(
  title: string,
  loadingMsg: string,
  fetcher: () => Promise<unknown>
) {
  const id = toast.loading(loadingMsg)
  try {
    const data = await fetcher()
    toast.dismiss(id)
    printReport(title, data)
  } catch (err) {
    toast.dismiss(id)
    toast.error(errMsg(err, `Gagal menyiapkan ${title}.`))
  }
}

export const DocActions = {
  shippingLabel: (ids: string[]) =>
    run("Label Pengiriman", "Menyiapkan label…", () => OutboundService.shippingLabel(ids)),
  pickList: (ids: string[]) =>
    run("Picklist", "Menyiapkan picklist…", () => OutboundService.pickListDoc(ids)),
  pickListById: (picklistId: string) =>
    run("Picklist", "Menyiapkan picklist…", () => OutboundService.pickListByPicklist(picklistId)),
  invoice: (ids: string[]) =>
    run("Faktur", "Menyiapkan faktur…", () => OutboundService.invoiceDoc(ids)),
  suratJalan: (ids: string[]) =>
    run("Surat Jalan", "Menyiapkan surat jalan…", () => OutboundService.suratJalanDoc(ids)),
  invoiceAndLabel: async (ids: string[]) => {
    await DocActions.invoice(ids)
    await DocActions.shippingLabel(ids)
  },
  suratJalanAndInvoice: async (ids: string[]) => {
    await DocActions.suratJalan(ids)
    await DocActions.invoice(ids)
  },
}
