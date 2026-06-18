"use client"

import {
  AlertTriangleIcon,
  CheckCircleIcon,
  FileTextIcon,
  InfoIcon,
  PackageIcon,
  RulerIcon,
  TruckIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { CategoryRules } from "@/services/master-produk/upload.service"

interface CategoryRulesCardProps {
  rules: CategoryRules | null
}

export function CategoryRulesCard({ rules }: CategoryRulesCardProps) {
  if (!rules) return null

  const certs = rules.productCertifications
  const hasAnything =
    certs.length > 0 ||
    rules.manufacturer.isRequired ||
    rules.packageDimension.isRequired ||
    rules.sizeChart.isSupported ||
    rules.cod.isSupported

  if (!hasAnything) return null

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <InfoIcon className="size-4 text-muted-foreground" />
        Persyaratan Kategori
      </h4>

      {certs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sertifikasi
          </p>
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="flex items-start gap-2 text-sm"
            >
              <FileTextIcon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <span className="font-medium">{cert.name}</span>
                {cert.isRequired ? (
                  <Badge variant="destructive" className="ml-2 text-[10px] font-normal px-1.5 py-0">
                    Wajib
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2 text-[10px] font-normal px-1.5 py-0">
                    Opsional
                  </Badge>
                )}
                {cert.documentDetails && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {cert.documentDetails}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Persyaratan Lainnya
        </p>

        {rules.manufacturer.isRequired && (
          <RuleItem icon={CheckCircleIcon} label="Info Manufacturer" required />
        )}
        {rules.packageDimension.isRequired && (
          <RuleItem icon={PackageIcon} label="Dimensi Paket" required />
        )}
        {rules.sizeChart.isSupported && (
          <RuleItem
            icon={RulerIcon}
            label="Size Chart"
            required={rules.sizeChart.isRequired}
            supported
          />
        )}
        {rules.cod.isSupported && (
          <RuleItem icon={TruckIcon} label="COD" supported />
        )}
      </div>
    </div>
  )
}

function RuleItem({
  icon: Icon,
  label,
  required,
  supported,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  required?: boolean
  supported?: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 text-muted-foreground" />
      <span>{label}</span>
      {required ? (
        <Badge variant="destructive" className="text-[10px] font-normal px-1.5 py-0">
          Wajib
        </Badge>
      ) : supported ? (
        <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
          Didukung
        </Badge>
      ) : null}
    </div>
  )
}
