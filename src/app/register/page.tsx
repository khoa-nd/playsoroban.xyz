'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'child',
    parentUsername: '',
    language: 'en',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Redirect based on role
      if (data.user.role === 'parent') {
        router.push('/dashboard')
      } else {
        router.push('/play')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative" style={{ backgroundImage: "url('/bg-img.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Join PlaySoroban!</h1>
          <p className="text-gray-600">Start your math adventure</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'child' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                  formData.role === 'child'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Kid
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'parent' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                  formData.role === 'parent'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Parent
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {formData.role === 'child' ? "What's your name?" : 'Your name'}
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
              placeholder={formData.role === 'child' ? 'e.g., Alex' : 'e.g., Mom or Dad'}
              required
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a username
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
              placeholder="Your unique username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Create a password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
              placeholder="Something you'll remember"
              required
            />
          </div>

          {formData.role === 'child' && (
            <div>
              <label htmlFor="parentUsername" className="block text-sm font-medium text-gray-700 mb-2">
                Parent&apos;s username (optional)
              </label>
              <input
                type="text"
                id="parentUsername"
                value={formData.parentUsername}
                onChange={(e) => setFormData({ ...formData, parentUsername: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors text-lg"
                placeholder="Link to parent account"
              />
            </div>
          )}

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language / Ngôn ngữ
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, language: 'en' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                  formData.language === 'en'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">🇺🇸</span>
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, language: 'vi' })}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                  formData.language === 'vi'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">🇻🇳</span>
                <span>Tiếng Việt</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-lg"
          >
            {loading ? 'Creating account...' : 'Start Playing!'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-green-600 hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
