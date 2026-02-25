import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateChallenge, type GeneratedChallenge, type ChallengeType } from './challenges'
import { type Language } from './translations'

const THEMES_EN = [
  'space adventure',
  'underwater ocean',
  'dinosaurs',
  'superheroes',
  'farm animals',
  'magical forest',
  'pirates treasure',
  'cooking kitchen',
  'sports game',
  'birthday party',
]

const THEMES_VI = [
  'phiêu lưu vũ trụ',
  'đại dương sâu thẳm',
  'khủng long',
  'siêu anh hùng',
  'động vật nông trại',
  'khu rừng thần tiên',
  'kho báu cướp biển',
  'nhà bếp vui vẻ',
  'trò chơi thể thao',
  'tiệc sinh nhật',
]

const CHALLENGE_TYPES: ChallengeType[] = ['addition', 'subtraction', 'counting', 'pattern', 'comparison']

interface AIGeneratedChallenge extends GeneratedChallenge {
  theme: string
  story: string
}

// Generate AI challenge with user-provided API key
export async function generateAIChallengeWithKey(
  apiKey: string,
  difficulty: number = 1,
  preferredType?: ChallengeType,
  language: Language = 'en'
): Promise<AIGeneratedChallenge> {
  console.log('\n========== AI CHALLENGE GENERATION ==========')
  console.log('Difficulty:', difficulty)
  console.log('Preferred Type:', preferredType || 'random')
  console.log('Language:', language)
  console.log('API Key provided:', !!apiKey)

  // If no API key, fall back to local generation
  if (!apiKey) {
    console.log('❌ No API key provided, using local generation')
    const localChallenge = generateChallenge(difficulty, preferredType)
    return {
      ...localChallenge,
      theme: 'classic',
      story: localChallenge.question,
    }
  }

  const themes = language === 'vi' ? THEMES_VI : THEMES_EN
  const theme = themes[Math.floor(Math.random() * themes.length)]
  const type = preferredType || CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]

  console.log('Selected theme:', theme)
  console.log('Selected type:', type)

  // Determine number ranges based on difficulty
  let maxNumber: number
  if (difficulty <= 1) {
    maxNumber = 5
  } else if (difficulty <= 2) {
    maxNumber = 10
  } else if (difficulty <= 3) {
    maxNumber = 15
  } else {
    maxNumber = 20
  }

  console.log('Max number for difficulty:', maxNumber)

  const prompt = buildPrompt(type, difficulty, maxNumber, theme, language)
  console.log('\n--- PROMPT TO GEMINI ---')
  console.log(prompt.substring(0, 500) + '...')
  console.log('--- END PROMPT ---\n')

  try {
    console.log('🚀 Calling Gemini API...')
    const startTime = Date.now()

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const elapsed = Date.now() - startTime
    console.log(`✅ Gemini API responded in ${elapsed}ms`)

    console.log('\n--- GEMINI RESPONSE ---')
    console.log(text)
    console.log('--- END RESPONSE ---\n')

    const parsed = parseAIResponse(text, type, difficulty)
    console.log('Parsed challenge:', JSON.stringify(parsed, null, 2))
    console.log('==========================================\n')

    return {
      ...parsed,
      theme,
    }
  } catch (error) {
    console.error('❌ AI generation failed:', error)
    console.log('Falling back to local generation')
    // Fallback to local generation
    const localChallenge = generateChallenge(difficulty, type)
    return {
      ...localChallenge,
      theme: 'classic',
      story: localChallenge.question,
    }
  }
}

export async function generateAIChallenge(
  difficulty: number = 1,
  preferredType?: ChallengeType,
  language: Language = 'en'
): Promise<AIGeneratedChallenge> {
  // Use environment variable for backwards compatibility
  return generateAIChallengeWithKey(process.env.GEMINI_API_KEY || '', difficulty, preferredType, language)
}

function buildPrompt(type: ChallengeType, difficulty: number, maxNumber: number, theme: string, language: Language = 'en'): string {
  const langInstruction = language === 'vi'
    ? 'IMPORTANT: Write everything in Vietnamese (Tiếng Việt). The story, hint, and explanation must all be in Vietnamese.'
    : 'Write everything in English.'

  const baseInstructions = `You are creating a fun math challenge for a young child (K-2nd grade).
Theme: ${theme}
Difficulty: ${difficulty}/5 (use numbers 1-${maxNumber})
${langInstruction}

Create a short, engaging story-based math problem. Keep the story to 1-2 sentences.
The child should feel like they're helping a character or solving a real problem.

IMPORTANT: You must respond with ONLY a valid JSON object, no markdown, no code blocks, no other text. The format must be exactly:
{"story": "The fun story question", "answer": "the correct number answer as a string", "hint": "A helpful hint for the child", "explanation": "A friendly explanation of why the answer is correct"}`

  switch (type) {
    case 'addition':
      return `${baseInstructions}

Create an ADDITION problem where two small numbers (each between 1-${maxNumber}, sum no more than ${maxNumber + 5}) need to be added together.
Example theme application: "Captain Star found 3 moon rocks, then discovered 4 more. How many moon rocks does Captain Star have now?"

Generate a creative ${theme}-themed addition problem:`

    case 'subtraction':
      return `${baseInstructions}

Create a SUBTRACTION problem where a child subtracts a smaller number from a larger one (both between 1-${maxNumber}).
The result must be positive (0 or greater).
Example theme application: "The friendly dinosaur had 7 berries but shared 3 with a friend. How many berries are left?"

Generate a creative ${theme}-themed subtraction problem:`

    case 'counting':
      return `${baseInstructions}

Create a COUNTING problem where the child counts objects (between 2-${maxNumber} items).
Use emoji to show the objects they need to count.
Example: "Count the stars in the sky: ⭐ ⭐ ⭐ ⭐ ⭐"

Generate a creative ${theme}-themed counting problem with emoji objects:`

    case 'pattern':
      return `${baseInstructions}

Create a NUMBER PATTERN problem where the child finds what comes next.
Use simple patterns like counting by 1s or 2s, starting from a small number.
Example: "The rocket visits planets in order: 2, 4, 6, 8, ?"

Generate a creative ${theme}-themed pattern problem:`

    case 'comparison':
      return `${baseInstructions}

Create a COMPARISON problem where the child identifies which number is bigger or smaller.
Use two different numbers between 1-${maxNumber}.
Example: "Which treasure chest has MORE gold coins? Chest A has 5 coins. Chest B has 8 coins."

Generate a creative ${theme}-themed comparison problem. In the answer field, put just the larger or smaller number (whichever the question asks for):`

    default:
      return `${baseInstructions}

Create a simple math problem appropriate for young children:`
  }
}

function parseAIResponse(
  response: string,
  type: ChallengeType,
  difficulty: number
): Omit<AIGeneratedChallenge, 'theme'> {
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7)
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3)
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3)
    }
    cleanResponse = cleanResponse.trim()

    // Try to extract JSON from the response
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    if (!parsed.story || !parsed.answer) {
      throw new Error('Missing required fields')
    }

    const correctAnswer = parsed.answer.toString().trim()

    // Generate wrong options based on the correct answer
    const correctNum = parseInt(correctAnswer)
    let options: string[]

    if (!isNaN(correctNum)) {
      const wrongOptions = generateWrongOptions(correctNum)
      options = shuffle([correctAnswer, ...wrongOptions])
    } else {
      // For non-numeric answers, this shouldn't happen for math problems
      options = [correctAnswer]
    }

    return {
      type,
      difficulty,
      question: parsed.story,
      story: parsed.story,
      answer: correctAnswer,
      options,
      hint: parsed.hint || 'Take your time and think carefully!',
      explanation: parsed.explanation || `The answer is ${correctAnswer}. Great job!`,
      xpReward: 10 + difficulty * 3, // Slightly higher XP for AI challenges
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error, 'Response:', response)
    // Return a fallback
    const fallback = generateChallenge(difficulty, type)
    return {
      ...fallback,
      story: fallback.question,
    }
  }
}

function generateWrongOptions(correctAnswer: number): string[] {
  const wrong: Set<number> = new Set()
  const offsets = [-3, -2, -1, 1, 2, 3]

  while (wrong.size < 3) {
    const offset = offsets[Math.floor(Math.random() * offsets.length)]
    const wrongAnswer = correctAnswer + offset
    if (wrongAnswer >= 0 && wrongAnswer !== correctAnswer) {
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

// Generate multiple AI challenges (useful for pre-generating)
export async function generateAIChallenges(
  difficulty: number = 1,
  count: number = 5
): Promise<AIGeneratedChallenge[]> {
  const challenges: AIGeneratedChallenge[] = []
  const shuffledTypes = shuffle([...CHALLENGE_TYPES])

  for (let i = 0; i < count; i++) {
    const type = shuffledTypes[i % shuffledTypes.length]
    const challenge = await generateAIChallenge(difficulty, type)
    challenges.push(challenge)
  }

  return challenges
}
