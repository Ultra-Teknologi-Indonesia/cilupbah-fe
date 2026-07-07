"use client";

import * as React from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  height?: number;
  width?: number;
  className?: string;
}

export const Barcode = React.memo(function Barcode({
  value,
  height = 40,
  width = 1.4,
  className,
}: BarcodeProps) {
  const ref = React.useRef<SVGSVGElement>(null);

  React.useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        displayValue: false,
        height,
        width,
        margin: 0,
      });
    } catch {
      // Nilai tidak valid untuk CODE128 (mis. karakter tak didukung) — biarkan svg kosong.
    }
  }, [value, height, width]);

  return <svg ref={ref} className={className} />;
});
