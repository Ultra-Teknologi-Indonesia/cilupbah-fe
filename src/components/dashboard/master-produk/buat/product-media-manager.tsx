"use client"

import * as React from "react"
import {
  ImageIcon,
  PlayIcon,
  StarIcon,
  Trash2Icon,
  UploadCloudIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { DetailMedia } from "@/types/master-produk/product-detail"

export interface EditMediaItem {
  localId: string
  kind: "existing" | "new"
  mediaType: "image" | "video"
  url: string
  uuid: string | null
  file?: File
  isPrimary: boolean
}

const MAX_IMAGES = 9

let _seq = 0
function nextId(): string {
  _seq += 1
  return `m_${_seq}_${Math.round(performance.now())}`
}

function ensurePrimary(items: EditMediaItem[]): EditMediaItem[] {
  const imgs = items.filter((i) => i.mediaType === "image")
  const hasPrimary = imgs.some((i) => i.isPrimary)
  return items.map((i, idx) => {
    if (i.mediaType !== "image") return { ...i, isPrimary: false }
    if (!hasPrimary && i.localId === imgs[0]?.localId) return { ...i, isPrimary: true }
    return i
  })
}

/** Bangun state awal editor dari media produk (detail). */
export function mediaItemsFromDetail(media: DetailMedia[]): EditMediaItem[] {
  return ensurePrimary(
    media.map((m) => ({
      localId: nextId(),
      kind: "existing" as const,
      mediaType: m.mediaType,
      url: m.url,
      uuid: m.uuid,
      isPrimary: m.isPrimary,
    }))
  )
}

export function ProductMediaManager({
  value,
  onChange,
}: {
  value: EditMediaItem[]
  onChange: (items: EditMediaItem[]) => void
}) {
  const images = value.filter((i) => i.mediaType === "image")
  const video = value.find((i) => i.mediaType === "video") ?? null
  const [dragIdx, setDragIdx] = React.useState<number | null>(null)

  const commit = (next: EditMediaItem[]) => onChange(ensurePrimary(next))

  const addImages = (files: FileList | null) => {
    if (!files) return
    const room = MAX_IMAGES - images.length
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, room))
    if (picked.length === 0) return
    const added: EditMediaItem[] = picked.map((file) => ({
      localId: nextId(),
      kind: "new",
      mediaType: "image",
      url: URL.createObjectURL(file),
      uuid: null,
      file,
      isPrimary: false,
    }))
    commit([...value, ...added])
  }

  const removeItem = (localId: string) =>
    commit(value.filter((i) => i.localId !== localId))

  const setPrimary = (localId: string) =>
    commit(
      value.map((i) =>
        i.mediaType === "image" ? { ...i, isPrimary: i.localId === localId } : i
      )
    )

  const reorderImages = (from: number, to: number) => {
    if (from === to) return
    const imgs = [...images]
    const [moved] = imgs.splice(from, 1)
    imgs.splice(to, 0, moved)
    const others = value.filter((i) => i.mediaType !== "image")
    commit([...imgs, ...others])
  }

  const setVideo = (file: File | null) => {
    const withoutVideo = value.filter((i) => i.mediaType !== "video")
    if (!file) {
      commit(withoutVideo)
      return
    }
    commit([
      ...withoutVideo,
      {
        localId: nextId(),
        kind: "new",
        mediaType: "video",
        url: URL.createObjectURL(file),
        uuid: null,
        file,
        isPrimary: false,
      },
    ])
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Gambar */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium">Gambar Produk</h4>
          <span className="text-xs text-muted-foreground tabular-nums">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {images.map((item, idx) => (
            <div
              key={item.localId}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) reorderImages(dragIdx, idx)
                setDragIdx(null)
              }}
              onDragEnd={() => setDragIdx(null)}
              className={cn(
                "group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-muted/30 active:cursor-grabbing",
                item.isPrimary ? "border-primary ring-2 ring-primary/30" : "border-border/60",
                dragIdx === idx && "opacity-50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="size-full object-cover" />

              {item.isPrimary && (
                <span className="absolute left-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Utama
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!item.isPrimary ? (
                  <button
                    type="button"
                    onClick={() => setPrimary(item.localId)}
                    title="Jadikan gambar utama"
                    className="flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-white"
                  >
                    <StarIcon className="size-3" /> Utama
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.localId)}
                  title="Hapus gambar"
                  className="grid size-6 place-items-center rounded bg-white/90 text-destructive hover:bg-white"
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </div>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary">
              <UploadCloudIcon className="size-5" />
              <span className="text-xs">Tambah</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addImages(e.target.files)
                  e.target.value = ""
                }}
              />
            </label>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Seret untuk mengurutkan. Klik &ldquo;Utama&rdquo; untuk menjadikan gambar utama. Maks {MAX_IMAGES} gambar.
        </p>
      </div>

      {/* Video */}
      <div>
        <h4 className="mb-1 text-sm font-medium">Video Produk</h4>
        <p className="mb-2 text-xs text-muted-foreground">
          Format MP4, durasi maks. 1 menit, ukuran maks. 30MB.
        </p>
        {video ? (
          <div className="relative w-40 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={video.url}
              muted
              playsInline
              preload="metadata"
              className="aspect-square w-full object-cover"
              onLoadedData={(e) => { e.currentTarget.currentTime = 0.5 }}
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/10">
              <div className="grid size-9 place-items-center rounded-full bg-white/90 shadow-sm">
                <PlayIcon className="ml-0.5 size-4 fill-current text-foreground" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVideo(null)}
              title="Hapus video"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded bg-white/90 text-destructive hover:bg-white"
            >
              <Trash2Icon className="size-3.5" />
            </button>
            <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              Video
            </span>
          </div>
        ) : (
          <label className="flex size-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border/70 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary">
            <ImageIcon className="size-5" />
            <span className="text-xs">Tambah Video</span>
            <input
              type="file"
              accept="video/mp4"
              className="hidden"
              onChange={(e) => {
                setVideo(e.target.files?.[0] ?? null)
                e.target.value = ""
              }}
            />
          </label>
        )}
      </div>
    </div>
  )
}
