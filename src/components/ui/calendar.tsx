"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  startMonth,
  endMonth,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultStart = startMonth ?? new Date(2020, 0)
  const defaultEnd = endMonth ?? new Date(2030, 11)

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      startMonth={defaultStart}
      endMonth={defaultEnd}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "flex items-center justify-between px-1",
        caption_label: "hidden",
        dropdowns: "flex items-center gap-1.5",
        dropdown: "rounded-full border border-border bg-background px-2.5 py-1 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        months_dropdown: "appearance-none cursor-pointer",
        years_dropdown: "appearance-none cursor-pointer",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-7"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "size-7"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "w-9 text-center text-muted-foreground font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_start: "day-range-start rounded-l-full",
        range_end: "day-range-end rounded-r-full",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
        today: "bg-accent text-accent-foreground rounded-full",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
