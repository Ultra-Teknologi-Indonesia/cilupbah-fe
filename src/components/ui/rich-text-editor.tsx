"use client"

import * as React from "react"
import {
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  Heading2Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  LinkIcon,
  ImageIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  rows?: number
  id?: string
  invalid?: boolean
}


export function RichTextEditor({
  value = "",
  onChange,
  onBlur,
  placeholder,
  rows = 6,
  id,
  invalid,
}: RichTextEditorProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value
    }
  }, [value])

  const emit = () => onChange?.(ref.current?.innerHTML ?? "")

  const exec = (command: string, arg?: string) => {
    ref.current?.focus()
    document.execCommand(command, false, arg)
    emit()
  }

  const insertLink = () => {
    const url = window.prompt("URL tautan:")
    if (url) exec("createLink", url)
  }
  const insertImage = () => {
    const url = window.prompt("URL gambar:")
    if (url) exec("insertImage", url)
  }

  const isEmpty = !value || value === "<br>" || value === "<p></p>"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background shadow-xs transition-[color,box-shadow]",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30",
        invalid && "border-destructive ring-3 ring-destructive/20"
      )}
    >
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-border/60 bg-muted/30 px-1.5 py-1"
        
        onMouseDown={(e) => e.preventDefault()}
      >
        <ToolBtn label="Tebal" onClick={() => exec("bold")}>
          <BoldIcon />
        </ToolBtn>
        <ToolBtn label="Miring" onClick={() => exec("italic")}>
          <ItalicIcon />
        </ToolBtn>
        <ToolBtn label="Coret" onClick={() => exec("strikeThrough")}>
          <StrikethroughIcon />
        </ToolBtn>
        <Sep />
        <ToolBtn label="Judul" onClick={() => exec("formatBlock", "<h2>")}>
          <Heading2Icon />
        </ToolBtn>
        <ToolBtn label="Daftar" onClick={() => exec("insertUnorderedList")}>
          <ListIcon />
        </ToolBtn>
        <ToolBtn label="Daftar bernomor" onClick={() => exec("insertOrderedList")}>
          <ListOrderedIcon />
        </ToolBtn>
        <ToolBtn label="Kutipan" onClick={() => exec("formatBlock", "<blockquote>")}>
          <QuoteIcon />
        </ToolBtn>
        <Sep />
        <ToolBtn label="Tautan" onClick={insertLink}>
          <LinkIcon />
        </ToolBtn>
        <ToolBtn label="Gambar (URL)" onClick={insertImage}>
          <ImageIcon />
        </ToolBtn>
      </div>

      <div className="relative">
        {isEmpty && placeholder && (
          <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          id={id}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emit}
          onBlur={onBlur}
          style={{ minHeight: rows * 24 }}
          className={cn(
            "w-full px-3 py-2.5 text-sm leading-relaxed outline-none",
            "[&_strong]:font-semibold [&_em]:italic [&_del]:line-through",
            "[&_h2]:my-1 [&_h2]:text-lg [&_h2]:font-semibold",
            "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_blockquote]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
            "[&_img]:my-2 [&_img]:max-h-56 [&_img]:rounded-lg [&_img]:border [&_img]:border-border"
          )}
        />
      </div>
    </div>
  )
}

function ToolBtn({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4"
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border/60" />
}
