import type * as React from "react"
import type { JSX } from "@emotion/react"

interface VisuallyHiddenProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
}

export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>
}
