"use client"

import * as React from "react"
import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import { OrderService } from "@/services/pesanan/order.service"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n)
}

export default function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data, isLoading } = useQuery({
    queryKey: ["pesanan", "invoice", id],
    queryFn: () => OrderService.getById(id),
  })

  React.useEffect(() => {
    if (data) {
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat faktur...</p>
      </div>
    )
  }

  const order = data?.data
  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Pesanan tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[800px] bg-white p-8 text-black print:p-0">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          nav, header, aside, [data-sidebar] { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <div className="mb-8 flex items-start justify-between border-b border-gray-300 pb-6">
        <div>
          <h1 className="text-2xl font-bold">FAKTUR</h1>
          <p className="mt-1 text-sm text-gray-600">
            No: {order.salesorder_no}
          </p>
          {order.channel_order_no && (
            <p className="text-sm text-gray-600">
              Ref: {order.channel_order_no}
            </p>
          )}
        </div>
        <div className="text-right text-sm text-gray-600">
          <p className="font-semibold text-black">Cilupbah</p>
          {order.transaction_date && (
            <p>
              Tanggal:{" "}
              {format(new Date(order.transaction_date), "dd MMMM yyyy", {
                locale: idLocale,
              })}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-8 text-sm">
        <div>
          <p className="mb-1 font-semibold uppercase text-gray-500">
            Pelanggan
          </p>
          <p className="font-medium">{order.customer_name || "—"}</p>
          {order.shipping?.address && (
            <p className="mt-1 text-gray-600">{order.shipping.address}</p>
          )}
        </div>
        <div>
          <p className="mb-1 font-semibold uppercase text-gray-500">
            Pengiriman
          </p>
          {order.shipping?.provider ? (
            <>
              <p className="font-medium">{order.shipping.provider}</p>
              {order.shipping.tracking_number && (
                <p className="text-gray-600">
                  Resi: {order.shipping.tracking_number}
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-600">—</p>
          )}
          {order.location_name && (
            <p className="mt-1 text-gray-600">
              Gudang: {order.location_name}
            </p>
          )}
        </div>
      </div>

      <table className="mb-6 w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="pb-2 text-left font-semibold">Produk</th>
            <th className="pb-2 text-left font-semibold">SKU</th>
            <th className="pb-2 text-right font-semibold">Qty</th>
            <th className="pb-2 text-right font-semibold">Harga</th>
            <th className="pb-2 text-right font-semibold">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">{item.description || "—"}</td>
              <td className="py-2 text-gray-600">{item.sku}</td>
              <td className="py-2 text-right">{item.qty_in_base}</td>
              <td className="py-2 text-right">{formatCurrency(item.price)}</td>
              <td className="py-2 text-right">
                {formatCurrency(item.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(order.sub_total)}</span>
          </div>
          {order.total_disc > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Diskon</span>
              <span>-{formatCurrency(order.total_disc)}</span>
            </div>
          )}
          {order.total_tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Pajak</span>
              <span>{formatCurrency(order.total_tax)}</span>
            </div>
          )}
          {order.shipping_cost > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Ongkir</span>
              <span>{formatCurrency(order.shipping_cost)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatCurrency(order.grand_total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        <p>Dokumen ini dicetak secara otomatis oleh sistem Cilupbah</p>
      </div>
    </div>
  )
}
