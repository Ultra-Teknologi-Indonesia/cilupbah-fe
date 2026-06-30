"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import {
  ArrowLeftIcon,
  DownloadIcon,
  FileWarningIcon,
  PrinterIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DOCUMENT_TYPES,
  isDocumentType,
  type DocumentMeta,
  type DocumentTypeKey,
} from "@/lib/document-preview/registry"

import { PreviewToolbar } from "./preview-toolbar"

// react-pdf bergantung pada Canvas + Worker DOM; render hanya di klien
// supaya tidak meledak di SSR.
const PdfViewer = dynamic(() => import("./pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-8">
      <Skeleton className="aspect-[1/1.414] w-full max-w-[820px] rounded-xl" />
      <Skeleton className="aspect-[1/1.414] w-full max-w-[820px] rounded-xl" />
    </div>
  ),
})

export interface DocumentPreviewViewProps {
  type: string
  id: string
}

type LoadState =
  | { kind: "loading"; progress?: string }
  | { kind: "ready"; blob: Blob; objectUrl: string; meta?: DocumentMeta }
  | { kind: "error"; message: string }

export function DocumentPreviewView({ type, id }: DocumentPreviewViewProps) {
  const router = useRouter()
  // Re-mount sub-tree saat type/id atau reloadKey berganti supaya state internal
  // (loading/ready/error, scale, page) selalu mulai bersih tanpa setState
  // dalam effect body.
  const [reloadKey, setReloadKey] = React.useState(0)

  if (!isDocumentType(type)) {
    return (
      <UnknownTypeFallback type={type} onBack={() => router.push("/dashboard")} />
    )
  }

  return (
    <KnownDocumentPreview
      key={`${type}:${id}:${reloadKey}`}
      type={type}
      id={id}
      onRetry={() => setReloadKey((k) => k + 1)}
    />
  )
}

function KnownDocumentPreview({
  type,
  id,
  onRetry,
}: {
  type: DocumentTypeKey
  id: string
  onRetry: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const config = DOCUMENT_TYPES[type]
  const [state, setState] = React.useState<LoadState>({ kind: "loading" })
  const [pageNumber, setPageNumber] = React.useState(1)
  const [numPages, setNumPages] = React.useState(0)
  const [scale, setScale] = React.useState(1)

  // Stable string identity dipakai sebagai effect dep supaya tidak re-fetch
  // saat parent re-render dengan instance ReadonlyURLSearchParams baru.
  const queryString = searchParams.toString()

  // Fetch dokumen + cleanup object URL. Tidak ada setState sinkronus di sini —
  // initial value sudah "loading" lewat useState.
  React.useEffect(() => {
    let cancelled = false
    let createdUrl: string | null = null

    const query = new URLSearchParams(queryString)
    config
      .fetchPdf(id, query, (msg) => {
        if (!cancelled) setState({ kind: "loading", progress: msg })
      })
      .then(({ blob, meta }) => {
        if (cancelled) return
        createdUrl = URL.createObjectURL(blob)
        setState({ kind: "ready", blob, objectUrl: createdUrl, meta })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : "Dokumen tidak dapat dimuat."
        setState({ kind: "error", message })
      })

    return () => {
      cancelled = true
      if (createdUrl) URL.revokeObjectURL(createdUrl)
    }
  }, [config, id, queryString])

  // Keyboard nav: PgUp / PgDn / Arrow keys.
  React.useEffect(() => {
    if (state.kind !== "ready") return
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return
      if (e.key === "PageDown" || e.key === "ArrowRight") {
        setPageNumber((p) => Math.min(numPages || 1, p + 1))
      } else if (e.key === "PageUp" || e.key === "ArrowLeft") {
        setPageNumber((p) => Math.max(1, p - 1))
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [state.kind, numPages])

  const meta = state.kind === "ready" ? state.meta : undefined
  const subtitle = config.subtitle(id, meta)
  const filename = config.filename(id, meta)

  const handleDownload = () => {
    if (state.kind !== "ready") return
    const a = document.createElement("a")
    a.href = state.objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    toast.success(`${filename} diunduh`)
  }

  const handlePrint = () => {
    if (state.kind !== "ready") return
    // Strategi paling reliable lintas browser: pakai iframe tersembunyi
    // dengan PDF blob URL, lalu trigger contentWindow.print().
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    iframe.src = state.objectUrl
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
      } catch {
        toast.error("Browser memblokir print otomatis. Coba unduh lalu print manual.")
      }
    }
    document.body.appendChild(iframe)
    // Tahan ~30 dtk untuk memastikan dialog print masih punya iframe-nya.
    setTimeout(() => iframe.remove(), 30_000)
  }

  const backUrl = config.backUrl(id)

  const handleClose = () => {
    // Coba router.back() bila history ada, fallback ke backUrl.
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(backUrl)
    }
  }

  const handleBack = () => router.push(backUrl)

  // Fixed inset-0 supaya halaman preview menutupi semua layout dashboard
  // (sidebar/header) tanpa harus pakai route group.
  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleBack}
            aria-label="Kembali"
            className="shrink-0"
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {config.title}
            </div>
            <div className="truncate text-sm font-semibold">{subtitle}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-1.5 sm:inline-flex"
              onClick={handlePrint}
              disabled={state.kind !== "ready"}
            >
              <PrinterIcon className="size-4" />
              Print
            </Button>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5"
              onClick={handleDownload}
              disabled={state.kind !== "ready"}
            >
              <DownloadIcon className="size-4" />
              <span className="hidden sm:inline">Unduh</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              aria-label="Tutup"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      {state.kind === "ready" && numPages > 0 && (
        <PreviewToolbar
          pageNumber={pageNumber}
          numPages={numPages}
          scale={scale}
          onPageChange={(n) => setPageNumber(Math.min(numPages, Math.max(1, n)))}
          onScaleChange={setScale}
          onFit={() => setScale(1)}
        />
      )}

      {/* Body */}
      <main className="flex-1">
        {state.kind === "loading" && <LoadingState message={state.progress} />}
        {state.kind === "error" && (
          <ErrorState
            message={state.message}
            onRetry={onRetry}
            onBack={handleBack}
          />
        )}
        {state.kind === "ready" && (
          <div className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6 sm:py-10">
            <PdfViewer
              file={state.objectUrl}
              pageNumber={pageNumber}
              scale={scale}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(err) =>
                setState({
                  kind: "error",
                  message: err.message || "PDF gagal di-render.",
                })
              }
            />
          </div>
        )}
      </main>
    </div>
  )
}

function LoadingState({ message }: { message?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-10">
      {message && (
        <div className="mb-4 flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          {message}
        </div>
      )}
      <Skeleton className="aspect-[1/1.414] w-full max-w-[820px] rounded-xl" />
      <Skeleton className="aspect-[1/1.414] w-full max-w-[820px] rounded-xl" />
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
  onBack,
}: {
  message: string
  onRetry: () => void
  onBack: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <FileWarningIcon className="size-8 text-destructive" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">PDF tidak dapat dimuat</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onBack}>
          Kembali
        </Button>
        <Button size="sm" className="gap-1.5" onClick={onRetry}>
          <RefreshCwIcon className="size-4" />
          Coba lagi
        </Button>
      </div>
    </div>
  )
}

function UnknownTypeFallback({
  type,
  onBack,
}: {
  type: string
  onBack: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <FileWarningIcon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">Tipe dokumen tidak dikenali</p>
        <p className="text-xs text-muted-foreground">
          Tidak ada konfigurasi untuk tipe <code>{type}</code>.
        </p>
      </div>
      <Button size="sm" onClick={onBack}>
        Kembali ke dashboard
      </Button>
    </div>
  )
}
