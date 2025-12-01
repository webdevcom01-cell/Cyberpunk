import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ErrorBoundary } from "@/components/error-boundary"

// Component that throws an error
const ThrowError = () => {
  throw new Error("Test error")
}

const WorkingComponent = () => <div>Working content</div>

describe("ErrorBoundary", () => {
  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Working content")).toBeInTheDocument()
  })

  it("should render error UI when child throws", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("Test error")).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it("should render custom fallback if provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText("Custom error message")).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
