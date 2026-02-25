# PlaySoroban

A fun, gamified math learning platform for K-2nd graders featuring AI-powered challenges and bilingual support.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Vercel-4169E1?logo=postgresql)

## Features

### Math Challenges
- **5 Challenge Types**: Addition, Subtraction, Counting Patterns, Number Comparison, Word Problems
- **Adaptive Difficulty**: Questions scale from 1-5 based on player level
- **Two Question Sources**:
  - **Workbook Mode**: Curated questions from Cambridge Primary Mathematics Workbook 2
  - **AI Mode**: Dynamically generated challenges using Google Gemini with fun themes (space adventures, dinosaurs, pirates, and more!)

### Gamification System
- **Points & Levels**: Earn XP for correct answers, level up as you progress
- **Streaks**: Maintain daily streaks for bonus rewards
- **18 Collectible Badges**: Unlock achievements for milestones, speed, accuracy, and consistency

| Badge | Name | How to Earn |
|-------|------|-------------|
| 🌟 | First Steps | Complete your first challenge |
| 🔥 | On Fire | 3-day streak |
| ⚡ | Quick Thinker | Solve in under 10 seconds |
| 👑 | Consistency King | 30-day streak |
| 🌈 | Legend | Level 20 + 1000 challenges |

### Bilingual Support
- Full English and Vietnamese translations
- Switch languages instantly with the header toggle
- Questions regenerate in selected language

### Family-Friendly
- Parent and child account types
- Parent dashboard to monitor progress
- Safe, ad-free learning environment

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma 5
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (or use Vercel Postgres)

### Installation

```bash
# Clone the repository
git clone https://github.com/khoa-nd/playsoroban.xyz.git
cd playsoroban.xyz

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL

# Push database schema
npx prisma db push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

```env
POSTGRES_URL=your_postgresql_connection_string
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data (badges, questions, demo accounts)
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Parent dashboard
│   │   ├── login/       # Authentication
│   │   ├── play/        # Main game interface
│   │   └── register/    # User registration
│   └── lib/
│       ├── ai-challenges.ts   # Gemini AI integration
│       ├── challenges.ts      # Local challenge generation
│       ├── translations.ts    # i18n strings
│       └── auth.ts            # Session management
```

## Roadmap

- [ ] Multimedia questions with shapes and geometry
- [ ] Animated interactive puzzles
- [ ] Visual learning aids
- [ ] More workbook content
- [ ] Progress analytics for parents

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

---

Built with love for young mathematicians everywhere.
