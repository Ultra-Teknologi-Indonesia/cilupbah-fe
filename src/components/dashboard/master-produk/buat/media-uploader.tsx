"use client"

import * as React from "react"
import { UploadCloudIcon, VideoIcon, XIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

interface Preview {
  id: string
  url: string
  name: string
  file: File
}

const MAX_IMAGES = 9

export function MediaUploader({
  onChange,
}: {
  onChange?: (files: File[]) => void
}) {
  const [images, setImages] = React.useState<Preview[]>([])
  const [video, setVideo] = React.useState<Preview | null>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const imgInput = React.useRef<HTMLInputElement>(null)
  const vidInput = React.useRef<HTMLInputElement>(null)
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  React.useEffect(() => {
    onChangeRef.current?.(images.map((i) => i.file))
  }, [images])

  React.useEffect(
    () => () => {
      images.forEach((i) => URL.revokeObjectURL(i.url))
      if (video) URL.revokeObjectURL(video.url)
    },
    [images, video]
  )

  const addImages = (files: FileList | null) => {
    if (!files) return
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (images.length >= MAX_IMAGES) {
      toast.error(`Maksimal ${MAX_IMAGES} foto produk`)
      return
    }
    if (images.length + incoming.length > MAX_IMAGES) {
      toast.warning(`Hanya ${MAX_IMAGES - images.length} foto lagi yang bisa ditambahkan`)
    }
    const next = incoming
      .slice(0, MAX_IMAGES - images.length)
      .map((f, i) => ({
        id: `${f.name}-${i}-${f.size}`,
        url: URL.createObjectURL(f),
        name: f.name,
        file: f,
      }))
    setImages((prev) => [...prev, ...next].slice(0, MAX_IMAGES))
  }

  const removeImage = (id: string) =>
    setImages((prev) => prev.filter((i) => i.id !== id))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Gambar Produk</h3>
          <span className="text-xs text-muted-foreground">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            addImages(e.dataTransfer.files)
          }}
          className={cn(
            "rounded-2xl border border-dashed p-4 transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted/40"
              >

                <img src={img.url} alt={img.name} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.id)}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-black/5"
                  aria-label="Hapus gambar"
                >
                  <XIcon className="size-3" />
                </button>
              </div>
            ))}

            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => imgInput.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <UploadCloudIcon className="size-5" />
                <span className="text-[11px]">Tambah</span>
              </button>
            )}
          </div>

          {images.length === 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Tarik &amp; letakkan gambar di sini, atau klik kotak untuk memilih.
              Maks {MAX_IMAGES} gambar.
            </p>
          )}
        </div>
        <input
          ref={imgInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => addImages(e.target.files)}
        />
      </div>

      <div>
        <h3 className="mb-1 text-sm font-medium">Video Produk</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Format MP4, durasi maks. 1 menit, ukuran maks. 30MB.
        </p>
        {video ? (
          <div className="relative inline-flex aspect-square w-32 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
            <VideoIcon className="size-6 text-muted-foreground" />
            <span className="absolute bottom-1 left-1 right-6 truncate text-[10px] text-muted-foreground">
              {video.name}
            </span>
            <button
              type="button"
              onClick={() => setVideo(null)}
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-black/5"
              aria-label="Hapus video"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => vidInput.current?.click()}
            className="flex aspect-square w-32 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <ImageIcon className="size-5" />
            <span className="text-[11px]">Tambah Video</span>
          </button>
        )}
        <input
          ref={vidInput}
          type="file"
          accept="video/mp4"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f)
              setVideo({
                id: f.name,
                url: URL.createObjectURL(f),
                name: f.name,
                file: f,
              })
          }}
        />
      </div>
    </div>
  )
}
