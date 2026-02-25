import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { language } = await request.json()

    if (!language || !['en', 'vi'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { language },
    })

    return NextResponse.json({ success: true, language })
  } catch (error) {
    console.error('Language update error:', error)
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 })
  }
}
