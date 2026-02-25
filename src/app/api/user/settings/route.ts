import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        questionMode: true,
        geminiApiKey: true,
        language: true,
      },
    })

    return NextResponse.json({
      success: true,
      settings: {
        questionMode: user?.questionMode || 'local',
        hasApiKey: !!user?.geminiApiKey,
        language: user?.language || 'en',
      },
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { questionMode, geminiApiKey } = await request.json()

    const updateData: { questionMode?: string; geminiApiKey?: string } = {}

    if (questionMode && ['local', 'ai'].includes(questionMode)) {
      updateData.questionMode = questionMode
    }

    if (geminiApiKey !== undefined) {
      // Allow empty string to clear the key
      updateData.geminiApiKey = geminiApiKey || null
    }

    await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
