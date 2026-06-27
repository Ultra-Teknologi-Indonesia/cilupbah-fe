cat << 'INNER_EOF' > src/components/ui/data-table/data-table.tsx.tmp
"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import * as React from "react"
INNER_EOF
tail -n +5 src/components/ui/data-table/data-table.tsx >> src/components/ui/data-table/data-table.tsx.tmp
mv src/components/ui/data-table/data-table.tsx.tmp src/components/ui/data-table/data-table.tsx
