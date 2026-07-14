"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MarkdownProps {
  children: string;
  className?: string;
}

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "text-sm leading-relaxed text-foreground",
        "[&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-semibold",
        "[&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold",
        "[&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_p]:my-2",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-1",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_strong]:font-semibold",
        "[&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono",
        "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-4",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
        "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse",
        "[&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-xs",
        "[&_hr]:my-6 [&_hr]:border-border",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: MediaFigure,
          a: LinkOrEmbed,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Renders `![alt](src "title")` as a figure with caption.
 * When src is a video file, renders <video> instead.
 * Otherwise renders zoomable <img> (opens full-size in new tab on click).
 */
function MediaFigure({
  src,
  alt,
  title,
}: React.ComponentProps<"img">) {
  const source = typeof src === "string" ? src : "";
  if (!source) return null;
  const caption = title || alt || "";
  const isVideo = VIDEO_EXT.test(source);

  return (
    <figure className="my-4 flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-surface">
      {isVideo ? (
        <video
          src={source}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full bg-black"
        />
      ) : (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          title="Buka gambar ukuran penuh"
          className="block bg-muted/40 no-underline transition-opacity hover:opacity-90"
        >
          <img
            src={source}
            alt={alt ?? ""}
            loading="lazy"
            className="mx-auto block max-h-[520px] w-full object-contain"
          />
        </a>
      )}
      {caption && (
        <figcaption className="border-t border-border bg-background px-4 py-2 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * External links get a target="_blank" + icon; internal (starts with "/") stays SPA.
 */
function LinkOrEmbed({ href, children }: React.ComponentProps<"a">) {
  const url = href ?? "";
  const external = /^https?:\/\//i.test(url);
  if (!external) {
    return <a href={url}>{children}</a>;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
      {children}
      <ExternalLinkIcon className="size-3" />
    </a>
  );
}
