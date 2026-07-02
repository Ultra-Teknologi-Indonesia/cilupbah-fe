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

function openMarketplaceLabel(result: {
  type: string
  url?: string
  document_base64?: string
  content_type?: string
  source?: string
}) {
  if (result.type === "url" && result.url) {
    window.open(result.url, "_blank")
    return true
  }
  if (result.type === "base64" && result.document_base64) {
    const ct = result.content_type || "application/pdf"
    const dataUrl = `data:${ct};base64,${result.document_base64}`
    const win = window.open("", "_blank")
    if (win) {
      win.document.write(
        `<!doctype html><html><head><title>Label Pengiriman</title></head>` +
          `<body style="margin:0"><iframe src="${dataUrl}" style="width:100%;height:100vh;border:none"></iframe></body></html>`
      )
      win.document.close()
    }
    return true
  }
  return false
}

// Aksi dokumen (label, picklist, faktur, surat jalan, manifest). Objek helper
// imperatif — bukan hook react-query, tapi ditempatkan di layer hooks agar
// komponen tidak mengimpor `@/services/*` langsung.
export const DocActions = {
  shippingLabel: async (ids: string[]) => {
    const toastId = toast.loading("Menyiapkan label…")
    const fallbackIds: string[] = []

    try {
      // Try marketplace label for each order
      const results = await Promise.allSettled(
        ids.map((id) => OutboundService.marketplaceLabel(id))
      )

      for (let i = 0; i < results.length; i++) {
        const r = results[i]
        if (r.status === "fulfilled" && openMarketplaceLabel(r.value)) {
          continue
        }
        fallbackIds.push(ids[i])
      }

      toast.dismiss(toastId)

      // Fallback to local label for non-marketplace orders
      if (fallbackIds.length > 0) {
        const data = await OutboundService.shippingLabel(fallbackIds)
        printReport("Label Pengiriman", data)
      }
    } catch (err) {
      toast.dismiss(toastId)
      toast.error(errMsg(err, "Gagal menyiapkan label."))
    }
  },
  pickList: (ids: string[]) =>
    run("Picklist", "Menyiapkan picklist…", () => OutboundService.pickListDoc(ids)),
  pickListById: (picklistId: string) =>
    run("Picklist", "Menyiapkan picklist…", () => OutboundService.pickListByPicklist(picklistId)),
  invoice: (ids: string[]) =>
    run("Faktur", "Menyiapkan faktur…", () => OutboundService.invoiceDoc(ids)),
  suratJalan: (ids: string[]) =>
    run("Surat Jalan", "Menyiapkan surat jalan…", () => OutboundService.suratJalanDoc(ids)),
  manifest: (shipmentId: string) => {
    window.open(`/api/app/outbound/shipments/${shipmentId}/manifest-pdf`, "_blank")
  },
  invoiceAndLabel: async (ids: string[]) => {
    await DocActions.invoice(ids)
    await DocActions.shippingLabel(ids)
  },
  suratJalanAndInvoice: async (ids: string[]) => {
    await DocActions.suratJalan(ids)
    await DocActions.invoice(ids)
  },
}
