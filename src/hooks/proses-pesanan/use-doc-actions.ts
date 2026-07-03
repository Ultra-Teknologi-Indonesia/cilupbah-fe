import { toast } from "sonner";

import {
  openPrintLabelSizeDialog,
  type PrintLabelChoiceMap,
  type PrintLabelOrderInput,
} from "@/components/dashboard/proses-pesanan/shared/print-label-size-dialog";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";
import { printReport } from "@/lib/proses-pesanan/print";

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

async function run(
  title: string,
  loadingMsg: string,
  fetcher: () => Promise<unknown>,
) {
  const id = toast.loading(loadingMsg);
  try {
    const data = await fetcher();
    toast.dismiss(id);
    printReport(title, data);
  } catch (err) {
    toast.dismiss(id);
    toast.error(errMsg(err, `Gagal menyiapkan ${title}.`));
  }
}

function openMarketplaceLabel(result: {
  type: string;
  url?: string;
  document_base64?: string;
  content_type?: string;
  source?: string;
}) {
  if (result.type === "url" && result.url) {
    window.open(result.url, "_blank");
    return true;
  }
  if (result.type === "base64" && result.document_base64) {
    const ct = result.content_type || "application/pdf";
    const dataUrl = `data:${ct};base64,${result.document_base64}`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(
        `<!doctype html><html><head><title>Label Pengiriman</title></head>` +
          `<body style="margin:0"><iframe src="${dataUrl}" style="width:100%;height:100vh;border:none"></iframe></body></html>`,
      );
      win.document.close();
    }
    return true;
  }
  return false;
}

function toOrderInputs(
  input: PrintLabelOrderInput[] | string[],
): PrintLabelOrderInput[] {
  return input.map((o) =>
    typeof o === "string" ? { id: o, source: null } : o,
  );
}

async function runShippingLabel(orders: PrintLabelOrderInput[]) {
  const hasKnownSource = orders.some((o) => (o.source ?? "").length > 0);
  const choices: PrintLabelChoiceMap | null = hasKnownSource
    ? await openPrintLabelSizeDialog(orders)
    : {};

  if (choices === null) return;

  const toastId = toast.loading("Menyiapkan label…");
  const fallbackIds: string[] = [];

  try {
    const results = await Promise.allSettled(
      orders.map((o) => {
        const src = (o.source ?? "").toLowerCase();
        const choice = src ? choices[src] : undefined;
        return OutboundService.marketplaceLabel(o.id, choice);
      }),
    );

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === "fulfilled" && openMarketplaceLabel(r.value)) {
        continue;
      }
      fallbackIds.push(orders[i].id);
    }

    toast.dismiss(toastId);

    if (fallbackIds.length > 0) {
      const data = await OutboundService.shippingLabel(fallbackIds);
      printReport("Label Pengiriman", data);
    }
  } catch (err) {
    toast.dismiss(toastId);
    toast.error(errMsg(err, "Gagal menyiapkan label."));
  }
}

export const DocActions = {
  shippingLabel: (input: PrintLabelOrderInput[] | string[]) =>
    runShippingLabel(toOrderInputs(input)),
  pickList: (ids: string[]) =>
    run("Picklist", "Menyiapkan picklist…", () =>
      OutboundService.pickListDoc(ids),
    ),
  pickListById: (picklistId: string) =>
    run("Picklist", "Menyiapkan picklist…", () =>
      OutboundService.pickListByPicklist(picklistId),
    ),
  invoice: (ids: string[]) =>
    run("Faktur", "Menyiapkan faktur…", () => OutboundService.invoiceDoc(ids)),
  suratJalan: (ids: string[]) =>
    run("Surat Jalan", "Menyiapkan surat jalan…", () =>
      OutboundService.suratJalanDoc(ids),
    ),
  manifest: (shipmentId: string) => {
    window.open(
      `/api/app/outbound/shipments/${shipmentId}/manifest-pdf`,
      "_blank",
    );
  },
  invoiceAndLabel: async (input: PrintLabelOrderInput[] | string[]) => {
    const orders = toOrderInputs(input);
    await DocActions.invoice(orders.map((o) => o.id));
    await runShippingLabel(orders);
  },
  suratJalanAndInvoice: async (ids: string[]) => {
    await DocActions.suratJalan(ids);
    await DocActions.invoice(ids);
  },
};
