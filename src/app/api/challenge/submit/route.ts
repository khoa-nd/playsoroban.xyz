import { NextRequest, NextResponse } from 'next/server'
import { getSession, calculateLevel } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const {
      challengeType,
      difficulty,
      question,
      answer,
      userAnswer,
      isCorrect,
      timeTaken,
      xpReward,
    } = await request.json()

    // Create or find the challenge
    const challenge = await prisma.challenge.create({
      data: {
        type: challengeType,
        difficulty: difficulty || 1,
        question,
        answer,
        xpReward: xpReward || 10,
      },
    })

    // Calculate XP earned (only if correct)
    const xpEarned = isCorrect ? xpReward : 0

    // Create the attempt record
    await prisma.challengeAttempt.create({
      data: {
        userId: session.id,
        challengeId: challenge.id,
        userAnswer,
        isCorrect,
        timeTaken,
        xpEarned,
      },
    })

    // Get user's current data
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate new XP and level
    const newTotalXp = user.totalXp + xpEarned
    const newLevel = calculateLevel(newTotalXp)

    // Calculate streak
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if user was active yesterday
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null
    let newStreak = user.currentStreak

    if (isCorrect) {
      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0)
        const lastActiveTime = lastActive.getTime()

        if (lastActiveTime === today.getTime()) {
          // Already active today, keep streak
          newStreak = user.currentStreak
        } else if (lastActiveTime === yesterday.getTime()) {
          // Was active yesterday, increment streak
          newStreak = user.currentStreak + 1
        } else {
          // Missed days, reset streak
          newStreak = 1
        }
      } else {
        // First activity
        newStreak = 1
      }
    }

    const newLongestStreak = Math.max(user.longestStreak, newStreak)

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveAt: isCorrect ? new Date() : user.lastActiveAt,
      },
    })

    // Check for new badges
    let newBadge = null

    // Get total correct attempts
    const totalCorrect = await prisma.challengeAttempt.count({
      where: {
        userId: session.id,
        isCorrect: true,
      },
    })

    // Check milestone badges
    const milestoneCounts = [1, 5, 25, 100]
    for (const count of milestoneCounts) {
      if (totalCorrect === count) {
        const badge = await prisma.badge.findFirst({
          where: {
            requirement: { contains: `"challenges_completed"` },
          },
        })

        if (badge) {
          // Try to parse and match
          const badges = await prisma.badge.findMany({
            where: {
              category: 'milestone',
            },
          })

          for (const b of badges) {
            const req = JSON.parse(b.requirement)
            if (req.type === 'challenges_completed' && req.count === count) {
              // Check if user already has this badge
              const existing = await prisma.userBadge.findUnique({
                where: {
                  userId_badgeId: {
                    userId: session.id,
                    badgeId: b.id,
                  },
                },
              })

              if (!existing) {
                await prisma.userBadge.create({
                  data: {
                    userId: session.id,
                    badgeId: b.id,
                  },
                })
                newBadge = b
                break
              }
            }
          }
        }
      }
    }

    // Check streak badges
    const streakCounts = [3, 7, 30]
    for (const count of streakCounts) {
      if (newStreak === count) {
        const badges = await prisma.badge.findMany({
          where: {
            category: 'streak',
          },
        })

        for (const b of badges) {
          const req = JSON.parse(b.requirement)
          if (req.type === 'streak' && req.count === count) {
            const existing = await prisma.userBadge.findUnique({
              where: {
                userId_badgeId: {
                  userId: session.id,
                  badgeId: b.id,
                },
              },
            })

            if (!existing) {
              await prisma.userBadge.create({
                data: {
                  userId: session.id,
                  badgeId: b.id,
                },
              })
              newBadge = b
              break
            }
          }
        }
      }
    }

    // Check level badges
    const levelCounts = [5, 10]
    for (const count of levelCounts) {
      if (newLevel === count && user.currentLevel < count) {
        const badges = await prisma.badge.findMany({
          where: {
            category: 'milestone',
          },
        })

        for (const b of badges) {
          const req = JSON.parse(b.requirement)
          if (req.type === 'level' && req.count === count) {
            const existing = await prisma.userBadge.findUnique({
              where: {
                userId_badgeId: {
                  userId: session.id,
                  badgeId: b.id,
                },
              },
            })

            if (!existing) {
              await prisma.userBadge.create({
                data: {
                  userId: session.id,
                  badgeId: b.id,
                },
              })
              newBadge = b
              break
            }
          }
        }
      }
    }

    // Check speed badge (under 10 seconds)
    if (isCorrect && timeTaken && timeTaken < 10) {
      const speedBadge = await prisma.badge.findFirst({
        where: {
          category: 'speed',
          requirement: { contains: '"speed"' },
        },
      })

      if (speedBadge) {
        const req = JSON.parse(speedBadge.requirement)
        if (req.type === 'speed' && req.seconds >= timeTaken) {
          const existing = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: session.id,
                badgeId: speedBadge.id,
              },
            },
          })

          if (!existing) {
            await prisma.userBadge.create({
              data: {
                userId: session.id,
                badgeId: speedBadge.id,
              },
            })
            newBadge = speedBadge
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        totalXp: updatedUser.totalXp,
        currentLevel: updatedUser.currentLevel,
        currentStreak: updatedUser.currentStreak,
      },
      xpEarned,
      newBadge,
    })
  } catch (error) {
    console.error('Challenge submit error:', error)
    return NextResponse.json({ error: 'Failed to submit challenge' }, { status: 500 })
  }
}
