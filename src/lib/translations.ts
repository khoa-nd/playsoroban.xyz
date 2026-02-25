export type Language = 'en' | 'vi'

export const translations = {
  en: {
    // Header
    greeting: 'Hi,',
    points: 'Points',
    streak: 'Streak',
    level: 'Level',
    logout: 'Logout',

    // Stats bar
    todaysChallenges: "Today's Challenges",
    correct: 'Correct',
    badges: 'Badges',

    // Challenge card
    ai: 'AI',
    needHint: 'Need a hint?',

    // Results
    correctAnswer: 'Correct!',
    wrongAnswer: 'Not quite...',

    // Buttons
    nextChallenge: 'Next Challenge!',
    loading: 'Loading...',
    awesome: 'Awesome!',

    // Badge modal
    newBadge: 'New Badge!',

    // Badges section
    yourBadges: 'Your Badges:',
    locked: 'Locked',

    // Loading
    creatingChallenge: 'Creating your challenge...',
    poweredByAI: 'Powered by AI',

    // Language
    language: 'Language',
    english: 'English',
    vietnamese: 'Tiếng Việt',

    // Question mode toggle
    questionSource: 'Question Source',
    localQuestions: 'Workbook',
    aiQuestions: 'AI Generated',
    enterApiKey: 'Enter your Gemini API key',
    saveApiKey: 'Save',
    apiKeyRequired: 'API key required for AI mode',
    apiKeySaved: 'API key saved!',
    howToGetKey: 'How to get a free API key',
    apiKeyGuide: 'Visit Google AI Studio (aistudio.google.com), sign in with Google, and create a free API key.',
    fromWorkbook: 'From Workbook',

    // Next Feature teaser
    nextFeature: 'Next Feature',
    comingSoon: 'Coming Soon!',
    multimediaTitle: 'Multimedia Math Questions',
    multimediaDesc1: 'Interactive geometry with shapes and visuals',
    multimediaDesc2: 'Animated questions that bring math to life',
    multimediaDesc3: 'Visual learning for better understanding',
    featureShapes: 'Shapes & Geometry',
    featureAnimated: 'Animated Puzzles',
    featureVisual: 'Visual Learning',
    stayTuned: 'Stay tuned for this exciting update!',
    close: 'Close',
  },
  vi: {
    // Header
    greeting: 'Chào,',
    points: 'Điểm',
    streak: 'Chuỗi',
    level: 'Cấp độ',
    logout: 'Đăng xuất',

    // Stats bar
    todaysChallenges: 'Thử thách hôm nay',
    correct: 'Đúng',
    badges: 'Huy hiệu',

    // Challenge card
    ai: 'AI',
    needHint: 'Cần gợi ý?',

    // Results
    correctAnswer: 'Chính xác!',
    wrongAnswer: 'Chưa đúng...',

    // Buttons
    nextChallenge: 'Câu tiếp theo!',
    loading: 'Đang tải...',
    awesome: 'Tuyệt vời!',

    // Badge modal
    newBadge: 'Huy hiệu mới!',

    // Badges section
    yourBadges: 'Huy hiệu của bạn:',
    locked: 'Chưa mở',

    // Loading
    creatingChallenge: 'Đang tạo thử thách...',
    poweredByAI: 'Được hỗ trợ bởi AI',

    // Language
    language: 'Ngôn ngữ',
    english: 'English',
    vietnamese: 'Tiếng Việt',

    // Question mode toggle
    questionSource: 'Nguồn câu hỏi',
    localQuestions: 'Sách bài tập',
    aiQuestions: 'AI tạo',
    enterApiKey: 'Nhập API key Gemini của bạn',
    saveApiKey: 'Lưu',
    apiKeyRequired: 'Cần API key cho chế độ AI',
    apiKeySaved: 'Đã lưu API key!',
    howToGetKey: 'Cách lấy API key miễn phí',
    apiKeyGuide: 'Truy cập Google AI Studio (aistudio.google.com), đăng nhập bằng Google và tạo API key miễn phí.',
    fromWorkbook: 'Từ sách bài tập',

    // Next Feature teaser
    nextFeature: 'Tính Năng Tiếp Theo',
    comingSoon: 'Sắp Ra Mắt!',
    multimediaTitle: 'Câu Hỏi Toán Đa Phương Tiện',
    multimediaDesc1: 'Hình học tương tác với hình khối và hình ảnh',
    multimediaDesc2: 'Câu hỏi động giúp toán học sống động',
    multimediaDesc3: 'Học trực quan để hiểu sâu hơn',
    featureShapes: 'Hình Khối & Hình Học',
    featureAnimated: 'Câu Đố Động',
    featureVisual: 'Học Trực Quan',
    stayTuned: 'Hãy đón chờ bản cập nhật thú vị này!',
    close: 'Đóng',
  },
}

export function t(lang: Language, key: keyof typeof translations.en): string {
  return translations[lang][key] || translations.en[key]
}

// All 18 badges with their translations
export const ALL_BADGES = [
  { id: 'first-steps', icon: '🌟', nameEn: 'First Steps', nameVi: 'Bước đầu tiên' },
  { id: 'getting-started', icon: '🎯', nameEn: 'Getting Started', nameVi: 'Khởi đầu' },
  { id: 'math-explorer', icon: '🧭', nameEn: 'Math Explorer', nameVi: 'Nhà thám hiểm' },
  { id: 'math-champion', icon: '🏆', nameEn: 'Math Champion', nameVi: 'Nhà vô địch' },
  { id: 'on-fire', icon: '🔥', nameEn: 'On Fire', nameVi: 'Rực cháy' },
  { id: 'week-warrior', icon: '⚔️', nameEn: 'Week Warrior', nameVi: 'Chiến binh tuần' },
  { id: 'consistency-king', icon: '👑', nameEn: 'Consistency King', nameVi: 'Vua kiên trì' },
  { id: 'sharp-mind', icon: '🧠', nameEn: 'Sharp Mind', nameVi: 'Trí tuệ sắc bén' },
  { id: 'perfect-week', icon: '💎', nameEn: 'Perfect Week', nameVi: 'Tuần hoàn hảo' },
  { id: 'quick-thinker', icon: '⚡', nameEn: 'Quick Thinker', nameVi: 'Nhanh trí' },
  { id: 'lightning-fast', icon: '🚀', nameEn: 'Lightning Fast', nameVi: 'Nhanh như chớp' },
  { id: 'level-5', icon: '⭐', nameEn: 'Level 5', nameVi: 'Cấp 5' },
  { id: 'level-10', icon: '🌟', nameEn: 'Level 10', nameVi: 'Cấp 10' },
  { id: 'early-bird', icon: '🐦', nameEn: 'Early Bird', nameVi: 'Chim sớm' },
  { id: 'night-owl', icon: '🦉', nameEn: 'Night Owl', nameVi: 'Cú đêm' },
  { id: 'math-master', icon: '🎓', nameEn: 'Math Master', nameVi: 'Bậc thầy toán' },
  { id: 'super-streak', icon: '💪', nameEn: 'Super Streak', nameVi: 'Siêu chuỗi' },
  { id: 'legend', icon: '🌈', nameEn: 'Legend', nameVi: 'Huyền thoại' },
]
