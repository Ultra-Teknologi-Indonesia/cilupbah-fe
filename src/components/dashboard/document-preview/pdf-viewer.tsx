"use client"

import * as React from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

import { cn } from "@/lib/utils"

// Worker disalin ke /public/pdf.worker.min.mjs pada install hook (lihat README).
// `workerSrc` HARUS diset di module yang sama dengan komponen react-pdf
// (dokumen react-pdf 10.x), karena module yang dimuat belakangan bisa
// menimpa setting di file lain.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

export interface PdfViewerProps {
  // String berarti URL (mis. object URL); File adalah binary upload yang sudah
  // dibungkus. react-pdf 10.x sudah tidak menerima Blob langsung pada tipe
  // `file`, jadi caller bertanggung jawab membungkus jadi URL atau File.
  file: string | File | null
  pageNumber: number
  scale: number
  onLoadSuccess: (info: { numPages: number }) => void
  onLoadError: (err: Error) => void
  className?: string
}

const loadingNode = (
  <div className="flex h-[60vh] w-full items-center justify-center text-sm text-muted-foreground">
    Memuat dokumen…
  </div>
)

const errorNode = (
  <div className="flex h-[60vh] w-full items-center justify-center text-sm text-destructive">
    Dokumen gagal dimuat
  </div>
)

export function PdfViewer({
  file,
  pageNumber,
  scale,
  onLoadSuccess,
  onLoadError,
  className,
}: PdfViewerProps) {
  // Stabilkan referensi agar react-pdf tidak re-fetch tiap render.
  const fileProp = React.useMemo(() => file ?? null, [file])

  // react-pdf <Page> butuh dimensi container untuk scaling responsif.
  // Strategi: render dengan width terbatas (max ~820px), biarkan zoom kalikan scale.
  return (
    <div className={cn("flex w-full flex-col items-center gap-4", className)}>
      {fileProp ? (
        <Document
          file={fileProp}
          onLoadSuccess={onLoadSuccess}
          onLoadError={onLoadError}
          loading={loadingNode}
          error={errorNode}
          className="flex flex-col items-center gap-4"
        >
          <PdfPage pageNumber={pageNumber} scale={scale} />
        </Document>
      ) : (
        loadingNode
      )}
    </div>
  )
}

function PdfPage({ pageNumber, scale }: { pageNumber: number; scale: number }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.18)] ring-1 ring-black/[0.04]">
      <Page
        pageNumber={pageNumber}
        scale={scale}
        renderTextLayer
        renderAnnotationLayer
        // 820px base width terlihat enak di desktop; scale dipakai sebagai pengali.
        width={820}
        loading={
          <div className="flex h-[60vh] w-[min(820px,90vw)] items-center justify-center text-sm text-muted-foreground">
            Merender halaman…
          </div>
        }
      />
    </div>
  )
}
