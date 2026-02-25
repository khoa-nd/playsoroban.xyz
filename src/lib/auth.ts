import { cookies } from 'next/headers'
import { prisma } from './db'

const SESSION_COOKIE = 'playsoroban_session'

export async function createSession(userId: string) {
  const sessionToken = crypto.randomUUID()
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, `${userId}:${sessionToken}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  return sessionToken
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (!session?.value) {
    return null
  }

  const [userId] = session.value.split(':')

  if (!userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      language: true,
      questionMode: true,
      totalXp: true,
      currentLevel: true,
      currentStreak: true,
      longestStreak: true,
      parentId: true,
    },
  })

  return user
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function validateCredentials(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || user.password !== password) {
    return null
  }

  return user
}

export function calculateLevel(totalXp: number): number {
  // XP needed per level increases: 100, 200, 300, etc.
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  let level = 1
  let xpNeeded = 100
  let totalXpNeeded = 0

  while (totalXp >= totalXpNeeded + xpNeeded) {
    totalXpNeeded += xpNeeded
    level++
    xpNeeded = level * 100
  }

  return level
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * 100
}

export function xpProgressInLevel(totalXp: number, currentLevel: number): number {
  let xpUsed = 0
  for (let i = 1; i < currentLevel; i++) {
    xpUsed += i * 100
  }
  return totalXp - xpUsed
}
