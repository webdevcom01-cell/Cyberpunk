import { describe, it, expect } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AgentDialog } from "../../components/agent-dialog"

describe("AgentBuilder", () => {
  it("renders agent dialog", () => {
    render(<AgentDialog open={true} onOpenChange={() => {}} />)
    expect(screen.getByText("Create Agent")).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    render(<AgentDialog open={true} onOpenChange={() => {}} />)

    const submitButton = screen.getByRole("button", { name: /save agent/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it("shows all form fields", () => {
    render(<AgentDialog open={true} onOpenChange={() => {}} />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/goal/i)).toBeInTheDocument()
  })
})
