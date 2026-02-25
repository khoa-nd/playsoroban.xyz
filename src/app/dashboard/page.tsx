import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  // Parents can access dashboard, children get redirected to play
  if (session.role === 'child') {
    redirect('/play')
  }

  // Get children's data
  const children = await prisma.user.findMany({
    where: { parentId: session.id },
    include: {
      earnedBadges: {
        include: { badge: true },
      },
      challengeAttempts: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  })

  // Calculate stats for each child
  const childrenStats = await Promise.all(
    children.map(async (child) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const thisWeekStart = new Date(today)
      thisWeekStart.setDate(thisWeekStart.getDate() - 7)

      const totalAttempts = child.challengeAttempts.length
      const correctAttempts = child.challengeAttempts.filter((a) => a.isCorrect).length
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

      const todaysAttempts = child.challengeAttempts.filter(
        (a) => new Date(a.createdAt) >= today
      ).length

      const weekAttempts = child.challengeAttempts.filter(
        (a) => new Date(a.createdAt) >= thisWeekStart
      ).length

      const recentAttempts = child.challengeAttempts.slice(0, 10)

      return {
        ...child,
        totalAttempts,
        correctAttempts,
        accuracy,
        todaysAttempts,
        weekAttempts,
        recentAttempts,
      }
    })
  )

  const handleLogout = async () => {
    'use server'
    const { clearSession } = await import('@/lib/auth')
    await clearSession()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/bg-img.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">PlaySoroban</h1>
            <p className="text-white/80">Parent Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80">Welcome, {session.name}</span>
            <form action={handleLogout}>
              <button
                type="submit"
                className="text-white/70 hover:text-white transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Children Linked Yet</h2>
            <p className="text-gray-600 mb-6">
              When your child creates an account with your username as the parent, they&apos;ll appear here.
            </p>
            <p className="text-gray-500 text-sm">
              Your username: <strong>{session.username}</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {childrenStats.map((child) => (
              <div key={child.id} className="bg-white rounded-xl shadow overflow-hidden">
                {/* Child Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">{child.name}</h2>
                      <p className="text-white/80">@{child.username}</p>
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold">{child.currentLevel}</div>
                        <div className="text-sm text-white/70">Level</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{child.totalXp}</div>
                        <div className="text-sm text-white/70">Points</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{child.currentStreak}</div>
                        <div className="text-sm text-white/70">Streak</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">{child.todaysAttempts}</div>
                      <div className="text-sm text-gray-600">Today</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{child.weekAttempts}</div>
                      <div className="text-sm text-gray-600">This Week</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{child.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">{child.longestStreak}</div>
                      <div className="text-sm text-gray-600">Best Streak</div>
                    </div>
                  </div>

                  {/* Badges */}
                  {child.earnedBadges.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Earned Badges</h3>
                      <div className="flex flex-wrap gap-3">
                        {child.earnedBadges.map((ub) => (
                          <div
                            key={ub.id}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center gap-2"
                          >
                            <span className="text-2xl">{ub.badge.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800">{ub.badge.name}</div>
                              <div className="text-xs text-gray-500">{ub.badge.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  {child.recentAttempts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
                      <div className="space-y-2">
                        {child.recentAttempts.slice(0, 5).map((attempt) => (
                          <div
                            key={attempt.id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className={attempt.isCorrect ? 'text-green-500' : 'text-red-500'}>
                                {attempt.isCorrect ? '✓' : '✗'}
                              </span>
                              <span className="text-gray-600">
                                {new Date(attempt.createdAt).toLocaleDateString()} at{' '}
                                {new Date(attempt.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {attempt.isCorrect && (
                              <span className="text-green-600 font-medium">+{attempt.xpEarned} Points</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Child Section */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add a Child Account</h3>
          <p className="text-gray-600 mb-4">
            To link a child account, have them sign up and enter your username (<strong>{session.username}</strong>) as their parent.
          </p>
          <Link
            href="/register"
            className="inline-block bg-purple-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Child Account
          </Link>
        </div>
      </main>
    </div>
  )
}
