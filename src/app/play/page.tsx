import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import PlayClient from './PlayClient'

export default async function PlayPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user's earned badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: session.id },
    include: { badge: true },
  })

  // Get today's attempts count
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaysAttempts = await prisma.challengeAttempt.count({
    where: {
      userId: session.id,
      createdAt: { gte: today },
    },
  })

  const correctToday = await prisma.challengeAttempt.count({
    where: {
      userId: session.id,
      createdAt: { gte: today },
      isCorrect: true,
    },
  })

  return (
    <PlayClient
      user={{
        ...session,
        language: session.language || 'en',
      }}
      badges={userBadges.map((ub) => ub.badge)}
      todaysAttempts={todaysAttempts}
      correctToday={correctToday}
    />
  )
}
