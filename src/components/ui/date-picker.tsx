"use client"

import * as React from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
  className,
  id,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {value ? format(value, "dd MMMM yyyy", { locale: idLocale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  disablePast?: boolean
  className?: string
  id?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal & jam",
  disabled,
  disablePast,
  className,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const hours = value ? String(value.getHours()).padStart(2, "0") : "00"
  const minutes = value ? String(value.getMinutes()).padStart(2, "0") : "00"

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const merged = new Date(date)
    if (value) {
      merged.setHours(value.getHours(), value.getMinutes(), 0, 0)
    } else {
      const now = new Date()
      merged.setHours(now.getHours(), now.getMinutes(), 0, 0)
    }
    onChange?.(merged)
  }

  const handleTimeChange = (type: "hours" | "minutes", val: string) => {
    const num = parseInt(val, 10)
    if (isNaN(num)) return
    const base = value ? new Date(value) : new Date()
    if (type === "hours" && num >= 0 && num <= 23) base.setHours(num)
    if (type === "minutes" && num >= 0 && num <= 59) base.setMinutes(num)
    base.setSeconds(0, 0)
    onChange?.(base)
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!value}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {value
            ? format(value, "dd MMMM yyyy, HH:mm", { locale: idLocale })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={disablePast ? { before: now } : undefined}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t px-3 py-3">
          <span className="text-sm text-muted-foreground">Jam</span>
          <input
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={(e) => handleTimeChange("hours", e.target.value)}
            className="h-8 w-14 rounded-md border border-border bg-background px-2 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <span className="text-sm font-medium">:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => handleTimeChange("minutes", e.target.value)}
            className="h-8 w-14 rounded-md border border-border bg-background px-2 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  disabled,
  className,
  id,
}: DateRangePickerProps) {
  const label = value?.from
    ? value.to
      ? `${format(value.from, "dd MMM yyyy", { locale: idLocale })} – ${format(value.to, "dd MMM yyyy", { locale: idLocale })}`
      : format(value.from, "dd MMM yyyy", { locale: idLocale })
    : null

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          data-empty={!label}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {label ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
