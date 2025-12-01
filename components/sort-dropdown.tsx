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
import { ArrowUp, ArrowDown } from "lucide-react"

export interface SortOption {
  label: string
  value: string
}

interface SortDropdownProps {
  options: SortOption[]
  value: string
  direction: "asc" | "desc"
  onSort: (value: string, direction: "asc" | "desc") => void
}

export function SortDropdown({ options, value, direction, onSort }: SortDropdownProps) {
  const currentOption = options.find((opt) => opt.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-muted/50 border-white/10">
          {direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          Sort: {currentOption?.label || "Default"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-white/10 w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              if (value === option.value) {
                onSort(option.value, direction === "asc" ? "desc" : "asc")
              } else {
                onSort(option.value, "asc")
              }
            }}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {value === option.value &&
              (direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
