import { toast } from "@/components/ui/sonner";

type ApiErrorBody = {
  status?: number;
  title?: string | null;
  message?: string | null;
  errors?: Record<string, string[] | string> | null;
};

const SERVER_ERROR_TITLE = "Terjadi kesalahan server";
const SERVER_ERROR_DESCRIPTION =
  "Silakan laporkan ke admin/developer terkait masalah ini.";

function extractValidationSummary(
  errors?: ApiErrorBody["errors"],
): string | null {
  if (!errors || typeof errors !== "object") return null;
  const flat: string[] = [];
  for (const value of Object.values(errors)) {
    if (Array.isArray(value)) flat.push(...value);
    else if (typeof value === "string") flat.push(value);
  }
  return flat.length ? flat.join(" ") : null;
}

function normalize(err: unknown): ApiErrorBody {
  if (err && typeof err === "object") return err as ApiErrorBody;
  if (typeof err === "string") return { message: err };
  return {};
}

export function apiError(err: unknown, fallbackTitle = "Terjadi kesalahan") {
  const body = normalize(err);
  const status = body.status;

  if (status !== undefined && status >= 500) {
    toast.error(SERVER_ERROR_TITLE, { description: SERVER_ERROR_DESCRIPTION });
    return;
  }

  const beTitle = body.title?.trim() || undefined;
  const beMessage = body.message?.trim() || undefined;
  const validationSummary = extractValidationSummary(body.errors) ?? undefined;

  const title = beTitle ?? fallbackTitle;
  let description = beMessage ?? validationSummary;

  if (validationSummary && beMessage && validationSummary !== beMessage) {
    if (beTitle) {
      description = `${beMessage} — ${validationSummary}`;
    } else {
      description = validationSummary;
    }
  }

  if (description && description !== title) {
    toast.error(title, { description });
  } else {
    toast.error(title);
  }
}

type ApiSuccessBody = {
  title?: string | null;
  message?: string | null;
};

export function apiSuccess(
  res: ApiSuccessBody | null | undefined,
  fallbackTitle: string,
) {
  const beTitle = res?.title?.trim() || undefined;
  const beMessage = res?.message?.trim() || undefined;

  const title = beTitle ?? fallbackTitle;
  const description = beMessage;

  if (description && description !== title) {
    toast.success(title, { description });
  } else {
    toast.success(title);
  }
}
