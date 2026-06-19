"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function FormSectionCard({
  id,
  title,
  action,
  children,
}: {
  id?: string
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <Card className="gap-0 py-0 backdrop-blur-xl">
        <CardHeader className="flex-row items-center justify-between border-b py-4">
          <CardTitle className="text-base">{title}</CardTitle>
          {action}
        </CardHeader>
        <CardContent className="py-5">{children}</CardContent>
      </Card>
    </section>
  )
}
