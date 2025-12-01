"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Rocket, CheckCircle2, ArrowRight, Calendar, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"

interface OnboardingStep {
  id: number
  title: string
  description: string
  action: string
  completed: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [typingText, setTypingText] = useState("")
  const [showResult, setShowResult] = useState(false)

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 1,
      title: "Create your first AI agent",
      description: "Let's create your first agent in 30 seconds",
      action: "Create",
      completed: false,
    },
    {
      id: 2,
      title: "Run a task",
      description: "See your agent in action with a pre-made task",
      action: "Run",
      completed: false,
    },
    {
      id: 3,
      title: "Schedule automation",
      description: "Set up recurring executions to save time",
      action: "Schedule",
      completed: false,
    },
  ])

  const fullText =
    "Just generated a tweet about AI trends for 2025. Here's what I found: AI adoption is accelerating across industries..."

  useEffect(() => {
    if (isRunning && typingText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypingText(fullText.slice(0, typingText.length + 1))
      }, 20)
      return () => clearTimeout(timeout)
    } else if (isRunning && typingText.length === fullText.length) {
      setTimeout(() => {
        setShowResult(true)
        triggerConfetti()
      }, 500)
    }
  }, [isRunning, typingText])

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)
  }

  const handleStepAction = async (stepId: number) => {
    if (stepId === 1) {
      // Step 1: Create agent with pre-filled template
      setIsRunning(true)

      // Simulate agent creation
      setTimeout(() => {
        completeStep(1)
        setCurrentStep(1)
      }, 1500)
    } else if (stepId === 2) {
      // Step 2: Run task
      setIsRunning(true)
      setTypingText("")
      setShowResult(false)

      // Start typing effect
    } else if (stepId === 3) {
      // Step 3: Schedule automation
      completeStep(3)
      setCurrentStep(2)

      // Show success message
      setTimeout(() => {
        router.push("/workflows")
      }, 2000)
    }
  }

  const completeStep = (stepId: number) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, completed: true } : step)))
  }

  const progress = (steps.filter((s) => s.completed).length / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-medium text-primary">Quick Start Guide</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome to CrewAI Orchestrator</h1>
          <p className="text-lg text-muted-foreground">Get started in 3 minutes with instant gratification</p>
        </div>

        {/* Progress Bar */}
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={`glass-card transition-all ${currentStep === index ? "ring-2 ring-primary" : ""}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        step.completed
                          ? "bg-accent text-accent-foreground"
                          : currentStep === index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="font-bold">{step.id}</span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Step {step.id}: {step.title}
                      </CardTitle>
                      <CardDescription className="mt-1">{step.description}</CardDescription>
                    </div>
                  </div>
                  {!step.completed && (
                    <Button
                      onClick={() => handleStepAction(step.id)}
                      disabled={currentStep !== index || isRunning}
                      size="sm"
                      className="gap-2"
                    >
                      {step.action}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              {/* Step 1 Preview */}
              {step.id === 1 && currentStep === 0 && (
                <CardContent>
                  <div className="rounded-xl border bg-card/40 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge>Pre-filled Template</Badge>
                      <span className="text-sm text-muted-foreground">Blog Writer Agent</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Role:</strong> Content Creator
                      </p>
                      <p>
                        <strong>Goal:</strong> Write engaging blog posts
                      </p>
                      <p className="text-muted-foreground">One click to create!</p>
                    </div>
                  </div>
                </CardContent>
              )}

              {/* Step 2 Live Preview */}
              {step.id === 2 && currentStep === 1 && (
                <CardContent>
                  <div className="rounded-xl border bg-card/40 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                      <span className="text-sm font-medium">Blog Writer Agent is thinking...</span>
                    </div>

                    {isRunning && (
                      <>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-sm font-mono">{typingText}</p>
                          {typingText.length < fullText.length && (
                            <span className="inline-block h-4 w-1 animate-pulse bg-primary ml-1" />
                          )}
                        </div>

                        {showResult && (
                          <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3 text-accent animate-in fade-in">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Task completed successfully!</span>
                          </div>
                        )}
                      </>
                    )}

                    {!isRunning && (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Pre-made task: "Write a tweet about AI"</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}

              {/* Step 3 Schedule Setup */}
              {step.id === 3 && currentStep === 2 && (
                <CardContent>
                  <div className="rounded-xl border bg-card/40 p-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">Every Monday</p>
                          <p className="text-xs text-muted-foreground">Weekly schedule</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium">9:00 AM</p>
                          <p className="text-xs text-muted-foreground">Start time</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-accent/10 p-3 text-center">
                      <p className="text-sm font-medium text-accent">You just saved 2 hours/week!</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Completion Message */}
        {progress === 100 && (
          <Card className="glass-card border-accent animate-in fade-in">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Rocket className="h-6 w-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">You're all set!</h3>
                <p className="text-sm text-muted-foreground">Wow, ovo je lako! Ready to build amazing workflows.</p>
              </div>
              <Button onClick={() => router.push("/workflows")} size="lg" className="gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
