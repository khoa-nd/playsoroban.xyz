import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password, name, role, parentUsername, language } = await request.json()

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // If registering a child, find the parent
    let parentId: string | undefined
    if (role === 'child' && parentUsername) {
      const parent = await prisma.user.findUnique({
        where: { username: parentUsername },
      })
      if (!parent || parent.role !== 'parent') {
        return NextResponse.json(
          { error: 'Parent account not found' },
          { status: 400 }
        )
      }
      parentId = parent.id
    }

    const user = await prisma.user.create({
      data: {
        username,
        password, // Simple storage for demo
        name,
        role: role || 'child',
        language: language || 'en',
        parentId,
      },
    })

    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
