import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { type Language } from '@/lib/translations'

// Generate wrong options for multiple choice
function generateWrongOptions(correctAnswer: string): string[] {
  const correctNum = parseInt(correctAnswer)
  if (isNaN(correctNum)) {
    return []
  }

  const wrong: Set<number> = new Set()
  const offsets = [-3, -2, -1, 1, 2, 3]

  while (wrong.size < 3) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)]
    const wrongAnswer = correctNum + offset
    if (wrongAnswer >= 0 && wrongAnswer !== correctNum) {
      wrong.add(wrongAnswer)
    }
  }

  return Array.from(wrong).map(String)
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const language = (searchParams.get('lang') as Language) || session.language || 'en'

    // Get a random local question
    const count = await prisma.localQuestion.count()
    if (count === 0) {
      return NextResponse.json({ error: 'No questions available' }, { status: 404 })
    }

    const skip = Math.floor(Math.random() * count)
    const questions = await prisma.localQuestion.findMany({
      take: 1,
      skip: skip,
    })

    const question = questions[0]

    // Build response based on language
    const isVietnamese = language === 'vi'
    const questionText = isVietnamese ? question.questionVi : question.questionEn
    const answer = isVietnamese ? question.answerVi : question.answerEn
    const hint = isVietnamese ? question.hintVi : question.hintEn
    const explanation = isVietnamese ? question.explanationVi : question.explanationEn

    // Generate options
    const wrongOptions = generateWrongOptions(answer)
    const options = shuffle([answer, ...wrongOptions])

    return NextResponse.json({
      success: true,
      challenge: {
        type: question.type,
        difficulty: question.difficulty,
        question: questionText,
        answer: answer,
        options: options.length > 1 ? options : [answer],
        hint: hint,
        explanation: explanation,
        xpReward: question.xpReward,
        theme: 'classic',
        unit: question.unit,
        exercise: question.exercise,
      },
      isAI: false,
      isLocal: true,
    })
  } catch (error) {
    console.error('Local challenge error:', error)
    return NextResponse.json({ error: 'Failed to get challenge' }, { status: 500 })
  }
}
