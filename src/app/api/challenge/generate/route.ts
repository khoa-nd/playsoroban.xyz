import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { generateAIChallengeWithKey } from '@/lib/ai-challenges'
import { generateChallenge, type ChallengeType } from '@/lib/challenges'
import { type Language } from '@/lib/translations'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const difficulty = parseInt(searchParams.get('difficulty') || '1')
    const type = searchParams.get('type') as ChallengeType | undefined
    const language = (searchParams.get('lang') as Language) || session.language || 'en'

    // Get user's API key from database
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { geminiApiKey: true },
    })

    const apiKey = user?.geminiApiKey

    // Calculate difficulty based on user level if not provided
    const effectiveDifficulty = Math.min(Math.ceil(session.currentLevel / 2), 5)
    const finalDifficulty = difficulty || effectiveDifficulty

    let challenge

    if (apiKey) {
      // Use AI generation with user's Gemini API key
      challenge = await generateAIChallengeWithKey(apiKey, finalDifficulty, type, language as Language)
    } else {
      // Use local generation
      const localChallenge = generateChallenge(finalDifficulty, type)
      challenge = {
        ...localChallenge,
        theme: 'classic',
        story: localChallenge.question,
      }
    }

    return NextResponse.json({
      success: true,
      challenge,
      isAI: !!apiKey,
    })
  } catch (error) {
    console.error('Challenge generation error:', error)

    // Fallback to local generation on any error
    const fallback = generateChallenge(1)
    return NextResponse.json({
      success: true,
      challenge: {
        ...fallback,
        theme: 'classic',
        story: fallback.question,
      },
      isAI: false,
    })
  }
}
