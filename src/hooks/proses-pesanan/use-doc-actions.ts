import { toast } from "sonner";

import {
  openPrintLabelSizeDialog,
  type PrintLabelChoiceMap,
  type PrintLabelOrderInput,
} from "@/components/dashboard/proses-pesanan/shared/print-label-size-dialog";
import { OutboundService } from "@/services/proses-pesanan/outbound.service";
import { printReport } from "@/lib/proses-pesanan/print";
import { apiError } from "@/lib/toast";

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
    apiError(err, `Gagal menyiapkan ${title}.`);
  }
}

function toOrderInputs(
  input: PrintLabelOrderInput[] | string[],
): PrintLabelOrderInput[] {
  return input.map((o) =>
    typeof o === "string" ? { id: o, source: null } : o,
  );
}

async function runShippingLabel(orders: PrintLabelOrderInput[]) {
  const marketplaceOrders = orders.filter((o) => (o.source ?? "").length > 0);

  if (marketplaceOrders.length === 0) {
    toast.error("Cetak resi hanya tersedia untuk pesanan marketplace.");
    return;
  }

  const choices: PrintLabelChoiceMap | null =
    await openPrintLabelSizeDialog(marketplaceOrders);
  if (choices === null) return;

  for (const o of marketplaceOrders) {
    const src = (o.source ?? "").toLowerCase();
    const choice = choices[src];
    const params = new URLSearchParams();
    if (choice?.document_type) params.set("document_type", choice.document_type);
    if (choice?.document_size) params.set("document_size", choice.document_size);
    const qs = params.toString() ? `?${params}` : "";
    window.open(
      `/dashboard/document-preview/shipping-label/${o.id}${qs}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
}

export const DocActions = {
  shippingLabel: (input: PrintLabelOrderInput[] | string[]) =>
    runShippingLabel(toOrderInputs(input)),
  pickList: (ids: string[]) => {
    window.open(
      `/dashboard/document-preview/picklist-by-orders/${ids.join(",")}`,
      "_blank",
      "noopener,noreferrer",
    );
  },
  pickListById: (picklistId: string) =>
    run("Picklist", "Menyiapkan picklist…", () =>
      OutboundService.pickListByPicklist(picklistId),
    ),
  invoice: (ids: string[]) => {
    for (const id of ids) {
      window.open(
        `/dashboard/document-preview/invoice/${id}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  },
  suratJalan: (ids: string[]) => {
    window.open(
      `/dashboard/document-preview/surat-jalan-bulk/${ids.join(",")}`,
      "_blank",
      "noopener,noreferrer",
    );
  },
  manifest: (shipmentId: string) => {
    window.open(
      `/dashboard/document-preview/manifest/${shipmentId}`,
      "_blank",
      "noopener,noreferrer",
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
