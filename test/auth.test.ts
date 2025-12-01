import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

describe("Authentication", () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it("should hash password correctly", async () => {
    const password = "Test123!"
    const hashedPassword = await bcrypt.hash(password, 10)

    expect(hashedPassword).toBeDefined()
    expect(hashedPassword).not.toBe(password)
  })

  it("should verify password correctly", async () => {
    const password = "Test123!"
    const hashedPassword = await bcrypt.hash(password, 10)

    const isValid = await bcrypt.compare(password, hashedPassword)
    expect(isValid).toBe(true)
  })

  it("should reject invalid password", async () => {
    const password = "Test123!"
    const hashedPassword = await bcrypt.hash(password, 10)

    const isValid = await bcrypt.compare("WrongPassword!", hashedPassword)
    expect(isValid).toBe(false)
  })

  it("should create user with workspace", async () => {
    const testEmail = `test-${Date.now()}@example.com`
    const hashedPassword = await bcrypt.hash("Test123!", 10)

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: "Test User",
        workspaceMembers: {
          create: {
            role: "owner",
            workspace: {
              create: {
                name: "Test Workspace",
                slug: `test-workspace-${Date.now()}`,
                plan: "free",
              },
            },
          },
        },
      },
      include: {
        workspaceMembers: {
          include: {
            workspace: true,
          },
        },
      },
    })

    expect(user).toBeDefined()
    expect(user.email).toBe(testEmail)
    expect(user.workspaceMembers).toHaveLength(1)
    expect(user.workspaceMembers[0].role).toBe("owner")
    expect(user.workspaceMembers[0].workspace).toBeDefined()

    await prisma.workspaceMember.deleteMany({ where: { userId: user.id } })
    await prisma.workspace.deleteMany({ where: { id: user.workspaceMembers[0].workspaceId } })
    await prisma.user.delete({ where: { id: user.id } })
  })
})
