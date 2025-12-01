"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileJson, FileText, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface ExportMenuProps {
  data: any[]
  filename: string
  disabled?: boolean
}

export function ExportMenu({ data, filename, disabled }: ExportMenuProps) {
  const exportAsJSON = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    downloadBlob(blob, `${filename}.json`)
    toast.success("Exported as JSON")
  }

  const exportAsCSV = () => {
    if (data.length === 0) {
      toast.error("No data to export")
      return
    }

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          })
          .join(","),
      ),
    ]

    const csv = csvRows.join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    downloadBlob(blob, `${filename}.csv`)
    toast.success("Exported as CSV")
  }

  const exportAsTXT = () => {
    const text = data
      .map((item, index) => {
        const lines = Object.entries(item).map(([key, value]) => `${key}: ${value}`)
        return `\n--- Record ${index + 1} ---\n${lines.join("\n")}`
      })
      .join("\n")

    const blob = new Blob([text], { type: "text/plain" })
    downloadBlob(blob, `${filename}.txt`)
    toast.success("Exported as TXT")
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-muted/50 border-white/10" disabled={disabled}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-white/10 w-48">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
          <FileJson className="h-4 w-4" />
          JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsTXT} className="gap-2">
          <FileText className="h-4 w-4" />
          TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
