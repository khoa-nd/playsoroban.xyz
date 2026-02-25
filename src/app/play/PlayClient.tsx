'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { t, ALL_BADGES, type Language } from '@/lib/translations'

interface Challenge {
  type: string
  difficulty: number
  question: string
  story?: string
  answer: string
  options: string[]
  hint?: string
  explanation: string
  xpReward: number
  theme?: string
}

interface User {
  id: string
  name: string
  language: string
  totalXp: number
  currentLevel: number
  currentStreak: number
  longestStreak: number
}

interface Badge {
  id: string
  name: string
  icon: string
  description: string
}

interface Props {
  user: User
  badges: Badge[]
  todaysAttempts: number
  correctToday: number
}

type QuestionMode = 'local' | 'ai'

export default function PlayClient({ user, badges, todaysAttempts, correctToday }: Props) {
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [stats, setStats] = useState({
    totalXp: user.totalXp,
    currentStreak: user.currentStreak,
    todaysAttempts,
    correctToday,
  })
  const [startTime, setStartTime] = useState<number>(0)
  const [newBadge, setNewBadge] = useState<Badge | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingChallenge, setLoadingChallenge] = useState(true)
  const [isAIChallenge, setIsAIChallenge] = useState(false)
  const [lang, setLang] = useState<Language>((user.language as Language) || 'en')
  const [showLangMenu, setShowLangMenu] = useState(false)

  // Question mode state
  const [questionMode, setQuestionMode] = useState<QuestionMode>('local')
  const [apiKey, setApiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [showApiKeyTooltip, setShowApiKeyTooltip] = useState(false)
  const [showNextFeature, setShowNextFeature] = useState(false)

  // Get earned badge names for comparison
  const earnedBadgeNames = badges.map((b) => b.name)

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/user/settings')
        const data = await res.json()
        if (data.success) {
          setQuestionMode(data.settings.questionMode || 'local')
          setHasApiKey(data.settings.hasApiKey || false)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  const loadNewChallenge = useCallback(async (language: Language, mode: QuestionMode) => {
    setLoadingChallenge(true)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowHint(false)

    try {
      const endpoint = mode === 'ai' ? '/api/challenge/generate' : '/api/challenge/local'
      const res = await fetch(`${endpoint}?lang=${language}`)
      const data = await res.json()

      if (data.success && data.challenge) {
        setChallenge(data.challenge)
        setIsAIChallenge(data.isAI || false)
        setStartTime(Date.now())
      }
    } catch (error) {
      console.error('Failed to load challenge:', error)
    }

    setLoadingChallenge(false)
  }, [])

  useEffect(() => {
    loadNewChallenge(lang, questionMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeChange = async (newMode: QuestionMode) => {
    if (newMode === 'ai' && !hasApiKey) {
      setShowApiKeyInput(true)
      return
    }

    setQuestionMode(newMode)

    // Save mode preference
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionMode: newMode }),
      })
    } catch (error) {
      console.error('Failed to save mode:', error)
    }

    // Load new challenge with new mode
    loadNewChallenge(lang, newMode)
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return

    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: apiKey, questionMode: 'ai' }),
      })

      setHasApiKey(true)
      setQuestionMode('ai')
      setShowApiKeyInput(false)
      setApiKeySaved(true)
      setTimeout(() => setApiKeySaved(false), 3000)

      // Load new AI challenge
      loadNewChallenge(lang, 'ai')
    } catch (error) {
      console.error('Failed to save API key:', error)
    }
  }

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === lang) {
      setShowLangMenu(false)
      return
    }

    setLang(newLang)
    setShowLangMenu(false)

    // Update user preference
    try {
      await fetch('/api/user/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: newLang }),
      })
    } catch (error) {
      console.error('Failed to update language:', error)
    }

    // Load new challenge in the selected language
    loadNewChallenge(newLang, questionMode)
  }

  const handleAnswer = async (answer: string) => {
    if (showResult || loading) return

    setSelectedAnswer(answer)
    setLoading(true)

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const correct = answer === challenge?.answer

    setIsCorrect(correct)
    setShowResult(true)

    // Submit to server
    try {
      const res = await fetch('/api/challenge/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeType: challenge?.type,
          difficulty: challenge?.difficulty,
          question: challenge?.question,
          answer: challenge?.answer,
          userAnswer: answer,
          isCorrect: correct,
          timeTaken,
          xpReward: challenge?.xpReward || 10,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setStats({
          totalXp: data.user.totalXp,
          currentStreak: data.user.currentStreak,
          todaysAttempts: stats.todaysAttempts + 1,
          correctToday: stats.correctToday + (correct ? 1 : 0),
        })

        if (data.newBadge) {
          setNewBadge(data.newBadge)
        }
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loadingChallenge || !challenge) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center" style={{ backgroundImage: "url('/bg-img.jpg')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <div className="text-white text-2xl">{t(lang, 'creatingChallenge')}</div>
          <div className="text-white/70 text-sm mt-2">
            {questionMode === 'ai' ? t(lang, 'poweredByAI') : t(lang, 'fromWorkbook')}
          </div>
        </div>
      </div>
    )
  }

  // Get theme emoji
  const themeEmoji = challenge.theme ? getThemeEmoji(challenge.theme) : '🧮'

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/bg-img.jpg')" }}>
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          {/* Top row - Logo, Greeting, Stats, Language, Logout */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">PlaySoroban</h1>
              <span className="text-xl text-white/90">{t(lang, 'greeting')} <span className="font-bold text-white text-2xl">{user.name}</span>!</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{stats.totalXp}</div>
                <div className="text-xs text-white/70">{t(lang, 'points')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-300">{stats.currentStreak}</div>
                <div className="text-xs text-white/70">{t(lang, 'streak')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">Lv.{user.currentLevel}</div>
                <div className="text-xs text-white/70">{t(lang, 'level')}</div>
              </div>

              {/* Language Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
                >
                  <span className="text-lg">{lang === 'en' ? '🇺🇸' : '🇻🇳'}</span>
                  <span className="text-white text-sm">{lang === 'en' ? 'EN' : 'VI'}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl overflow-hidden z-50">
                    <button
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 ${lang === 'en' ? 'bg-purple-50' : ''}`}
                    >
                      <span className="text-xl">🇺🇸</span>
                      <span className="text-gray-800">English</span>
                    </button>
                    <button
                      onClick={() => handleLanguageChange('vi')}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 ${lang === 'vi' ? 'bg-purple-50' : ''}`}
                    >
                      <span className="text-xl">🇻🇳</span>
                      <span className="text-gray-800">Tiếng Việt</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white transition-colors"
              >
                {t(lang, 'logout')}
              </button>
            </div>
          </div>

          {/* Badges Row - 18 badges with lock icons for unearned */}
          <div className="bg-white/10 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <span className="text-white/70 text-sm whitespace-nowrap">{t(lang, 'yourBadges')}:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {ALL_BADGES.map((badge) => {
                  const isEarned = earnedBadgeNames.includes(badge.nameEn)
                  return (
                    <div
                      key={badge.id}
                      className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isEarned
                          ? 'bg-yellow-400/30 border-2 border-yellow-400'
                          : 'bg-gray-500/30 border-2 border-gray-500/50'
                      }`}
                      title={isEarned ? (lang === 'vi' ? badge.nameVi : badge.nameEn) : t(lang, 'locked')}
                    >
                      {isEarned ? (
                        <span className="text-2xl">{badge.icon}</span>
                      ) : (
                        <span className="text-xl text-gray-400">🔒</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Stats Bar */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 flex justify-around text-white">
            <div className="text-center">
              <div className="text-xl font-bold">{stats.todaysAttempts}</div>
              <div className="text-sm text-white/70">{t(lang, 'todaysChallenges')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{stats.correctToday}</div>
              <div className="text-sm text-white/70">{t(lang, 'correct')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{badges.length}/18</div>
              <div className="text-sm text-white/70">{t(lang, 'badges')}</div>
            </div>
          </div>

          {/* Question Mode Toggle - Above Challenge Card */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">{t(lang, 'questionSource')}:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModeChange('local')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    questionMode === 'local'
                      ? 'bg-white text-purple-700'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  📚 {t(lang, 'localQuestions')}
                </button>
                <button
                  onClick={() => handleModeChange('ai')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    questionMode === 'ai'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  🤖 {t(lang, 'aiQuestions')}
                </button>
              </div>
            </div>

            {/* API Key Input (shown when switching to AI mode without key) */}
            {showApiKeyInput && (
              <div className="mt-4 p-4 bg-white/10 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white font-medium">{t(lang, 'enterApiKey')}</span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowApiKeyTooltip(true)}
                      onMouseLeave={() => setShowApiKeyTooltip(false)}
                      className="w-5 h-5 rounded-full bg-white/30 text-white text-xs flex items-center justify-center hover:bg-white/40"
                    >
                      ?
                    </button>
                    {showApiKeyTooltip && (
                      <div className="absolute left-6 top-0 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50">
                        <p className="font-medium mb-1">{t(lang, 'howToGetKey')}</p>
                        <p className="text-gray-300 text-xs">{t(lang, 'apiKeyGuide')}</p>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline text-xs block mt-2"
                        >
                          aistudio.google.com/app/apikey
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {t(lang, 'saveApiKey')}
                  </button>
                  <button
                    onClick={() => setShowApiKeyInput(false)}
                    className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* API Key Saved Notification */}
            {apiKeySaved && (
              <div className="mt-3 text-green-300 text-sm flex items-center gap-2">
                <span>✓</span> {t(lang, 'apiKeySaved')}
              </div>
            )}
          </div>

          {/* Challenge Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{themeEmoji}</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {challenge.type}
                </span>
                {isAIChallenge ? (
                  <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    🤖 {t(lang, 'ai')}
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    📚
                  </span>
                )}
              </div>
              <span className="text-yellow-500 font-bold">+{challenge.xpReward} {t(lang, 'points')}</span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 whitespace-pre-line leading-relaxed">
                {challenge.question}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {challenge.options.map((option, index) => {
                let buttonClass = 'py-6 px-8 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 '

                if (showResult) {
                  if (option === challenge.answer) {
                    buttonClass += 'bg-green-500 text-white'
                  } else if (option === selectedAnswer) {
                    buttonClass += 'bg-red-500 text-white'
                  } else {
                    buttonClass += 'bg-gray-200 text-gray-400'
                  }
                } else {
                  buttonClass += 'bg-gradient-to-br from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult || loading}
                    className={buttonClass}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {/* Hint Button */}
            {!showResult && !showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="w-full text-purple-600 hover:text-purple-800 font-medium"
              >
                {t(lang, 'needHint')}
              </button>
            )}

            {/* Hint Display */}
            {showHint && !showResult && challenge.hint && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                <p className="text-yellow-800">{challenge.hint}</p>
              </div>
            )}

            {/* Result Display */}
            {showResult && (
              <div
                className={`rounded-xl p-6 text-center ${
                  isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="text-4xl mb-2">{isCorrect ? '🎉' : '😢'}</div>
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isCorrect ? t(lang, 'correctAnswer') : t(lang, 'wrongAnswer')}
                </h3>
                <p className="text-gray-600">{challenge.explanation}</p>
                {isCorrect && (
                  <p className="text-green-600 font-bold mt-2">+{challenge.xpReward} {t(lang, 'points')}!</p>
                )}
              </div>
            )}
          </div>

          {/* Next Challenge Button */}
          {showResult && (
            <button
              onClick={() => loadNewChallenge(lang, questionMode)}
              disabled={loadingChallenge}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-xl py-4 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loadingChallenge ? t(lang, 'loading') : t(lang, 'nextChallenge')}
            </button>
          )}
        </div>
      </main>

      {/* New Badge Modal */}
      {newBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 animate-bounce">
            <div className="text-6xl mb-4">{newBadge.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{t(lang, 'newBadge')}</h3>
            <p className="text-xl text-purple-600 font-semibold mb-2">{newBadge.name}</p>
            <p className="text-gray-600 mb-6">{newBadge.description}</p>
            <button
              onClick={() => setNewBadge(null)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold py-3 px-8 rounded-full"
            >
              {t(lang, 'awesome')}
            </button>
          </div>
        </div>
      )}

      {/* Next Feature Button - Fixed Bottom Right */}
      <button
        onClick={() => setShowNextFeature(true)}
        className="fixed bottom-6 right-6 z-40 group"
      >
        <div className="relative">
          {/* Animated pulse rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-ping opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse opacity-50"></div>

          {/* Main button */}
          <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 transform hover:scale-110 transition-all duration-300 hover:shadow-purple-500/50">
            <span className="text-xl animate-bounce">✨</span>
            <span className="font-bold text-sm whitespace-nowrap">{t(lang, 'nextFeature')}</span>
            <span className="text-xl animate-bounce" style={{ animationDelay: '0.1s' }}>🚀</span>
          </div>
        </div>
      </button>

      {/* Next Feature Popup Modal */}
      {showNextFeature && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-1">{t(lang, 'comingSoon')}</h2>
              <p className="text-white/90 text-lg">{t(lang, 'multimediaTitle')}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Feature cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Shapes & Geometry */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
                  <div className="text-4xl mb-2">
                    <svg className="w-12 h-12 mx-auto" viewBox="0 0 100 100">
                      {/* Triangle */}
                      <polygon points="50,10 90,90 10,90" fill="#3B82F6" opacity="0.8">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 63" to="360 50 63" dur="8s" repeatCount="indefinite"/>
                      </polygon>
                      {/* Circle */}
                      <circle cx="50" cy="55" r="20" fill="#8B5CF6" opacity="0.7">
                        <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      {/* Square */}
                      <rect x="35" y="40" width="30" height="30" fill="#EC4899" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate" from="0 50 55" to="-360 50 55" dur="6s" repeatCount="indefinite"/>
                      </rect>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-blue-700">{t(lang, 'featureShapes')}</p>
                </div>

                {/* Animated Puzzles */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                  <div className="text-4xl mb-2">
                    <svg className="w-12 h-12 mx-auto" viewBox="0 0 100 100">
                      {/* Animated puzzle pieces */}
                      <g>
                        <path d="M10,30 L40,30 L40,10 A15,15 0 0,1 40,30 L40,60 L10,60 Z" fill="#A855F7">
                          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
                        </path>
                        <path d="M50,30 L80,30 L80,60 L50,60 L50,40 A15,15 0 0,0 50,60 Z" fill="#7C3AED">
                          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
                        </path>
                        <path d="M10,70 L40,70 L40,100 L10,100 Z" fill="#C084FC">
                          <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
                        </path>
                        <path d="M50,70 L80,70 L80,100 L50,100 Z" fill="#8B5CF6">
                          <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
                        </path>
                      </g>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-purple-700">{t(lang, 'featureAnimated')}</p>
                </div>

                {/* Visual Learning */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 text-center">
                  <div className="text-4xl mb-2">
                    <svg className="w-12 h-12 mx-auto" viewBox="0 0 100 100">
                      {/* Eye with animated pupil */}
                      <ellipse cx="50" cy="50" rx="40" ry="25" fill="#FDF2F8" stroke="#EC4899" strokeWidth="3"/>
                      <circle cx="50" cy="50" r="15" fill="#EC4899">
                        <animate attributeName="cx" values="45;55;45" dur="3s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="50" cy="50" r="7" fill="#BE185D">
                        <animate attributeName="cx" values="45;55;45" dur="3s" repeatCount="indefinite"/>
                      </circle>
                      {/* Sparkles */}
                      <circle cx="45" cy="45" r="3" fill="white">
                        <animate attributeName="cx" values="40;50;40" dur="3s" repeatCount="indefinite"/>
                      </circle>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-pink-700">{t(lang, 'featureVisual')}</p>
                </div>
              </div>

              {/* Description list */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">📐</span>
                  <p className="text-gray-700">{t(lang, 'multimediaDesc1')}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">🎬</span>
                  <p className="text-gray-700">{t(lang, 'multimediaDesc2')}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-2xl">🧠</span>
                  <p className="text-gray-700">{t(lang, 'multimediaDesc3')}</p>
                </div>
              </div>

              {/* Preview animation showcase */}
              <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
                <p className="text-center text-sm text-gray-500 mb-3">Preview</p>
                <div className="flex justify-center items-center gap-4">
                  {/* Animated shapes preview */}
                  <svg className="w-16 h-16" viewBox="0 0 64 64">
                    <rect x="8" y="8" width="20" height="20" rx="2" fill="#3B82F6">
                      <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="4s" repeatCount="indefinite"/>
                    </rect>
                  </svg>
                  <svg className="w-16 h-16" viewBox="0 0 64 64">
                    <polygon points="32,8 56,56 8,56" fill="#EC4899">
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                    </polygon>
                  </svg>
                  <svg className="w-16 h-16" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="20" fill="#8B5CF6">
                      <animate attributeName="r" values="18;24;18" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  <svg className="w-16 h-16" viewBox="0 0 64 64">
                    <polygon points="32,4 40,28 64,28 44,44 52,68 32,52 12,68 20,44 0,28 24,28" fill="#F59E0B">
                      <animateTransform attributeName="transform" type="rotate" from="0 32 36" to="360 32 36" dur="6s" repeatCount="indefinite"/>
                    </polygon>
                  </svg>
                </div>
              </div>

              {/* Stay tuned message */}
              <p className="text-center text-gray-500 italic mb-4">{t(lang, 'stayTuned')}</p>

              {/* Close button */}
              <button
                onClick={() => setShowNextFeature(false)}
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity"
              >
                {t(lang, 'close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function getThemeEmoji(theme: string): string {
  const themeMap: Record<string, string> = {
    'space adventure': '🚀',
    'underwater ocean': '🐠',
    'dinosaurs': '🦕',
    'superheroes': '🦸',
    'farm animals': '🐄',
    'magical forest': '🌲',
    'pirates treasure': '🏴‍☠️',
    'cooking kitchen': '👨‍🍳',
    'sports game': '⚽',
    'birthday party': '🎂',
    'classic': '🧮',
    // Vietnamese themes
    'phiêu lưu vũ trụ': '🚀',
    'đại dương sâu thẳm': '🐠',
    'khủng long': '🦕',
    'siêu anh hùng': '🦸',
    'động vật nông trại': '🐄',
    'khu rừng thần tiên': '🌲',
    'kho báu cướp biển': '🏴‍☠️',
    'nhà bếp vui vẻ': '👨‍🍳',
    'trò chơi thể thao': '⚽',
    'tiệc sinh nhật': '🎂',
  }
  return themeMap[theme] || '🧮'
}
