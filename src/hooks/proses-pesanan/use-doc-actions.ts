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

const SUPPORTED_LABEL_CHANNELS = new Set(["shopee", "tiktok", "lazada"]);

async function runShippingLabel(orders: PrintLabelOrderInput[]) {
  const eligible = orders.filter((o) => {
    const src = (o.source ?? "").toLowerCase();
    return SUPPORTED_LABEL_CHANNELS.has(src);
  });

  const skipped = orders.length - eligible.length;
  if (eligible.length === 0) {
    toast.error("Kanal terpilih belum mendukung cetak resi otomatis.");
    return;
  }
  if (skipped > 0) {
    toast.info(`${skipped} pesanan dilewati (kanal belum didukung).`);
  }

  const choice: PrintLabelChoiceMap | null =
    await openPrintLabelSizeDialog(eligible);
  if (choice === null) return;
  const documentSize = choice.document_size;

  if (eligible.length === 1) {
    const o = eligible[0];
    const params = new URLSearchParams();
    params.set("document_size", documentSize);
    window.open(
      `/dashboard/document-preview/shipping-label/${o.id}?${params}`,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }

  const loadingId = toast.loading("Mengantre pencetakan label…");
  try {
    const { batch_id } = await OutboundService.createBulkShippingLabelBatch(
      eligible.map((o) => o.id),
      documentSize,
    );
    toast.dismiss(loadingId);
    window.open(
      `/dashboard/document-preview/shipping-label-bulk-async/${batch_id}`,
      "_blank",
      "noopener,noreferrer",
    );
  } catch (err) {
    toast.dismiss(loadingId);
    apiError(err, "Gagal memulai batch cetak label.");
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
    if (ids.length === 0) return;
    if (ids.length === 1) {
      window.open(
        `/dashboard/document-preview/invoice/${ids[0]}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    window.open(
      `/dashboard/document-preview/invoice-bulk/${ids.join(",")}`,
      "_blank",
      "noopener,noreferrer",
    );
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
