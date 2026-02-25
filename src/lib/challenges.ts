// Challenge types for K-2nd grade math
export type ChallengeType = 'addition' | 'subtraction' | 'counting' | 'pattern' | 'comparison'

export interface GeneratedChallenge {
  type: ChallengeType
  difficulty: number
  question: string
  questionData?: object
  answer: string
  options: string[]
  hint?: string
  explanation: string
  xpReward: number
}

// Generate a random number between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Shuffle an array
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate wrong answers that are close to the correct answer
function generateWrongOptions(correctAnswer: number, count: number): number[] {
  const wrong: Set<number> = new Set()
  const offsets = [-3, -2, -1, 1, 2, 3, 4, 5, -4, -5]

  while (wrong.size < count) {
    const offset = offsets[randomInt(0, offsets.length - 1)]
    const wrongAnswer = correctAnswer + offset
    if (wrongAnswer >= 0 && wrongAnswer !== correctAnswer) {
      wrong.add(wrongAnswer)
    }
  }

  return Array.from(wrong).slice(0, count)
}

// Generate an addition challenge
function generateAddition(difficulty: number): GeneratedChallenge {
  let maxNum: number
  if (difficulty <= 1) {
    maxNum = 5 // 0-5 for easiest
  } else if (difficulty <= 2) {
    maxNum = 10 // 0-10
  } else if (difficulty <= 3) {
    maxNum = 15 // 0-15
  } else {
    maxNum = 20 // 0-20
  }

  const a = randomInt(1, maxNum)
  const b = randomInt(1, maxNum - a + 1)
  const answer = a + b

  const wrongAnswers = generateWrongOptions(answer, 3)
  const options = shuffle([answer.toString(), ...wrongAnswers.map(String)])

  return {
    type: 'addition',
    difficulty,
    question: `What is ${a} + ${b}?`,
    questionData: { a, b, operation: 'add' },
    answer: answer.toString(),
    options,
    hint: `Try counting ${a}, then count ${b} more`,
    explanation: `${a} + ${b} = ${answer}. If you have ${a} apples and get ${b} more, you have ${answer} apples!`,
    xpReward: 10 + difficulty * 2,
  }
}

// Generate a subtraction challenge
function generateSubtraction(difficulty: number): GeneratedChallenge {
  let maxNum: number
  if (difficulty <= 1) {
    maxNum = 5
  } else if (difficulty <= 2) {
    maxNum = 10
  } else if (difficulty <= 3) {
    maxNum = 15
  } else {
    maxNum = 20
  }

  const a = randomInt(2, maxNum)
  const b = randomInt(1, a) // Ensure positive result
  const answer = a - b

  const wrongAnswers = generateWrongOptions(answer, 3)
  const options = shuffle([answer.toString(), ...wrongAnswers.map(String)])

  return {
    type: 'subtraction',
    difficulty,
    question: `What is ${a} - ${b}?`,
    questionData: { a, b, operation: 'subtract' },
    answer: answer.toString(),
    options,
    hint: `Start at ${a} and count backward ${b} times`,
    explanation: `${a} - ${b} = ${answer}. If you have ${a} cookies and eat ${b}, you have ${answer} left!`,
    xpReward: 10 + difficulty * 2,
  }
}

// Generate a counting challenge
function generateCounting(difficulty: number): GeneratedChallenge {
  let maxCount: number
  if (difficulty <= 1) {
    maxCount = 5
  } else if (difficulty <= 2) {
    maxCount = 10
  } else {
    maxCount = 15
  }

  const count = randomInt(2, maxCount)
  const items = ['apples', 'stars', 'hearts', 'balls', 'flowers']
  const item = items[randomInt(0, items.length - 1)]
  const emoji = item === 'apples' ? '🍎' : item === 'stars' ? '⭐' : item === 'hearts' ? '❤️' : item === 'balls' ? '⚽' : '🌸'
  const display = Array(count).fill(emoji).join(' ')

  const wrongAnswers = generateWrongOptions(count, 3)
  const options = shuffle([count.toString(), ...wrongAnswers.map(String)])

  return {
    type: 'counting',
    difficulty,
    question: `How many ${item} do you see?\n\n${display}`,
    questionData: { count, item, emoji },
    answer: count.toString(),
    options,
    hint: 'Point to each one and count out loud!',
    explanation: `There are ${count} ${item}. Great counting!`,
    xpReward: 8 + difficulty * 2,
  }
}

// Generate a number pattern challenge
function generatePattern(difficulty: number): GeneratedChallenge {
  let step: number
  if (difficulty <= 1) {
    step = 1 // Count by 1s
  } else if (difficulty <= 2) {
    step = 2 // Count by 2s
  } else {
    step = randomInt(1, 3) // Mix of 1s, 2s, or 3s
  }

  const start = randomInt(1, 5)
  const sequence: number[] = []
  for (let i = 0; i < 4; i++) {
    sequence.push(start + i * step)
  }
  const answer = start + 4 * step

  const display = sequence.join(', ') + ', ?'

  const wrongAnswers = generateWrongOptions(answer, 3)
  const options = shuffle([answer.toString(), ...wrongAnswers.map(String)])

  return {
    type: 'pattern',
    difficulty,
    question: `What comes next?\n\n${display}`,
    questionData: { sequence, step, start },
    answer: answer.toString(),
    options,
    hint: `Look at how much each number goes up by`,
    explanation: `The pattern is counting by ${step}s! ${sequence.join(' → ')} → ${answer}`,
    xpReward: 12 + difficulty * 2,
  }
}

// Generate a comparison challenge
function generateComparison(difficulty: number): GeneratedChallenge {
  let maxNum: number
  if (difficulty <= 1) {
    maxNum = 10
  } else if (difficulty <= 2) {
    maxNum = 20
  } else {
    maxNum = 50
  }

  const a = randomInt(1, maxNum)
  let b = randomInt(1, maxNum)
  // Ensure they're different
  while (b === a) {
    b = randomInt(1, maxNum)
  }

  const comparisonTypes = ['bigger', 'smaller']
  const comparison = comparisonTypes[randomInt(0, 1)]
  const answer = comparison === 'bigger' ? Math.max(a, b).toString() : Math.min(a, b).toString()

  const options = shuffle([a.toString(), b.toString()])

  return {
    type: 'comparison',
    difficulty,
    question: `Which number is ${comparison}?\n\n${a}  or  ${b}`,
    questionData: { a, b, comparison },
    answer,
    options,
    hint: comparison === 'bigger' ? 'The bigger number counts more' : 'The smaller number counts less',
    explanation: `${answer} is ${comparison} than ${answer === a.toString() ? b : a}!`,
    xpReward: 10 + difficulty * 2,
  }
}

// Main function to generate a challenge
export function generateChallenge(difficulty: number = 1, type?: ChallengeType): GeneratedChallenge {
  const types: ChallengeType[] = ['addition', 'subtraction', 'counting', 'pattern', 'comparison']
  const selectedType = type || types[randomInt(0, types.length - 1)]

  switch (selectedType) {
    case 'addition':
      return generateAddition(difficulty)
    case 'subtraction':
      return generateSubtraction(difficulty)
    case 'counting':
      return generateCounting(difficulty)
    case 'pattern':
      return generatePattern(difficulty)
    case 'comparison':
      return generateComparison(difficulty)
    default:
      return generateAddition(difficulty)
  }
}

// Generate today's daily challenge set (multiple challenges)
export function generateDailyChallenges(difficulty: number = 1, count: number = 5): GeneratedChallenge[] {
  const challenges: GeneratedChallenge[] = []
  const types: ChallengeType[] = ['addition', 'subtraction', 'counting', 'pattern', 'comparison']

  // Ensure variety by picking different types
  const shuffledTypes = shuffle(types)

  for (let i = 0; i < count; i++) {
    const type = shuffledTypes[i % types.length]
    challenges.push(generateChallenge(difficulty, type))
  }

  return challenges
}
