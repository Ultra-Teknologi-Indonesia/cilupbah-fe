"use client"

import * as React from "react"
import {
  PauseIcon,
  PlayIcon,
  Volume2Icon,
  VolumeOffIcon,
  MaximizeIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string
  poster?: string
  autoPlay?: boolean
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  className,
  ...props
}: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [muted, setMuted] = React.useState(true)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [showControls, setShowControls] = React.useState(true)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout>>(null)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
    } else {
      v.pause()
    }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * duration
  }

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  const scheduleHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    setShowControls(true)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500)
    }
  }

  React.useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div
      ref={containerRef}
      className={cn("group relative overflow-hidden rounded-xl bg-black", className)}
      onMouseMove={scheduleHide}
      onMouseLeave={() => playing && setShowControls(false)}
      {...props}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        className="size-full object-contain"
        onPlay={() => {
          setPlaying(true)
          scheduleHide()
        }}
        onPause={() => {
          setPlaying(false)
          setShowControls(true)
        }}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onClick={togglePlay}
      />

      {/* Play overlay when paused */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <div className="grid size-14 place-items-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <PlayIcon className="ml-0.5 size-6 fill-current text-foreground" />
          </div>
        </button>
      )}

      {/* Bottom controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex flex-col gap-1 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2.5 pt-8 transition-opacity duration-200",
          showControls ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {/* Progress bar */}
        <div
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={progress}
          className="group/bar relative h-1 cursor-pointer rounded-full bg-white/30 transition-[height] hover:h-1.5"
          onClick={handleSeek}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary"
            style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={togglePlay} className="text-white hover:text-primary">
            {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
          </button>

          <button type="button" onClick={toggleMute} className="text-white hover:text-primary">
            {muted ? <VolumeOffIcon className="size-4" /> : <Volume2Icon className="size-4" />}
          </button>

          <span className="flex-1 text-xs tabular-nums text-white/80">
            {fmt(progress)} / {fmt(duration)}
          </span>

          <button type="button" onClick={toggleFullscreen} className="text-white hover:text-primary">
            <MaximizeIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function VideoThumbnail({
  src,
  className,
  ...props
}: { src: string } & React.HTMLAttributes<HTMLDivElement>) {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="metadata"
        className="size-full object-cover"
        onLoadedData={(e) => {
          e.currentTarget.currentTime = 0.5
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
        <div className="grid size-8 place-items-center rounded-full bg-white/90 shadow-sm">
          <PlayIcon className="ml-0.5 size-3.5 fill-current text-foreground" />
        </div>
      </div>
    </div>
  )
}
