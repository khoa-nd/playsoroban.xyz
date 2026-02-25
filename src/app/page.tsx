import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getSession()

  // If logged in, redirect to appropriate page
  if (session) {
    if (session.role === 'parent') {
      redirect('/dashboard')
    } else {
      redirect('/play')
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/bg-img.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            PlaySoroban
          </h1>
          <p className="text-2xl text-white/90 mb-4">
            Daily Math Challenges for Young Minds
          </p>
          <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
            Make learning math fun with personalized challenges, rewards, and achievements.
            Perfect for K-2nd graders!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register"
              className="bg-white text-purple-600 font-bold text-xl py-4 px-8 rounded-full hover:bg-purple-100 transition-colors shadow-lg"
            >
              Start Learning
            </Link>
            <Link
              href="/login"
              className="bg-transparent border-2 border-white text-white font-bold text-xl py-4 px-8 rounded-full hover:bg-white/10 transition-colors"
            >
              Log In
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-5xl mb-4">🧮</div>
              <h3 className="text-xl font-bold mb-2">Daily Challenges</h3>
              <p className="text-white/80">
                Fresh math puzzles every day, tailored to your child&apos;s level
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-white/80">
                Collect badges, earn points, and level up as you learn
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Track Progress</h3>
              <p className="text-white/80">
                Parents can monitor learning and celebrate achievements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <p className="text-white/60 text-sm">
          Inspired by the Japanese Soroban (abacus) tradition of mental math
        </p>
      </div>
    </div>
  )
}
