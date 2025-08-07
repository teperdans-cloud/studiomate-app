# ArtMatch

> AI-powered platform connecting Australian artists with relevant opportunities and generating tailored applications

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12-brightgreen)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-06B6D4)](https://tailwindcss.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991)](https://openai.com/)

ArtMatch is a sophisticated web application designed to bridge the gap between Australian artists and opportunities in the art world. Using AI-powered matching algorithms and GPT-4o-mini for content generation, it provides personalized opportunity recommendations and generates professional application materials.

## 🚀 Features

### Core Functionality
- **🎯 AI-Powered Matching**: Sophisticated algorithm that scores opportunities based on location, career stage, artistic medium, and preferences
- **📝 Application Generation**: AI-generated artist statements and cover letters tailored to specific opportunities
- **👤 Artist Profiles**: Comprehensive profile system with career stage, artistic focus, and portfolio management
- **🔍 Opportunity Discovery**: Curated database of Australian art opportunities with intelligent filtering
- **📊 Match Scoring**: Visual feedback on compatibility with detailed reasoning for each match

### Technical Features
- **⚡ Next.js 14**: Modern React framework with App Router and Server Components
- **🔒 Authentication**: Secure NextAuth.js implementation with JWT sessions
- **🗄️ Database**: Prisma ORM with SQLite (development) and PostgreSQL (production) support
- **🎨 UI/UX**: Responsive design with Tailwind CSS and Radix UI components
- **🤖 AI Integration**: OpenAI GPT-4o-mini for intelligent content generation

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 14 + React 18 | Modern React framework with SSR/SSG |
| Language | TypeScript | Type safety and developer experience |
| Styling | Tailwind CSS | Utility-first CSS framework |
| Database | Prisma ORM + SQLite/PostgreSQL | Type-safe database access |
| Authentication | NextAuth.js | Secure authentication system |
| AI/ML | OpenAI API (GPT-4o-mini) | Content generation and matching |
| UI Components | Radix UI + Lucide React | Accessible, unstyled components |

### Project Structure
```
artmatch-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes
│   │   │   ├── auth/[...nextauth]/   # NextAuth.js configuration
│   │   │   ├── profile/              # Profile management
│   │   │   ├── opportunities/        # Opportunity endpoints
│   │   │   ├── matches/              # AI matching system
│   │   │   └── generate-application/ # AI application generation
│   │   ├── dashboard/                # Artist dashboard
│   │   ├── profile/setup/            # Profile onboarding
│   │   ├── opportunities/            # Opportunity browsing
│   │   ├── application/[id]/         # Generated applications
│   │   └── auth/signin/              # Authentication pages
│   ├── components/                   # Reusable React components
│   │   ├── Navigation.tsx            # Main navigation
│   │   └── SessionProvider.tsx       # Auth session provider
│   ├── lib/                          # Utilities and services
│   │   ├── prisma.ts                 # Database client
│   │   ├── matching.ts               # AI matching algorithm
│   │   └── openai.ts                 # OpenAI integration
│   └── types/                        # TypeScript definitions
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Database seeding
├── public/                           # Static assets
├── opportunities-data.csv            # Initial opportunity data
└── README.md
```

## 📊 Database Schema

### Core Models
```prisma
User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  // NextAuth.js fields
  artist        Artist?   // One-to-one relationship
}

Artist {
  id               String   @id @default(cuid())
  bio              String?
  location         String?
  careerStage      String?  // emerging, early-career, mid-career, established
  artisticFocus    String?  // comma-separated mediums
  interestedRegions String? // comma-separated regions
  // Relationships
  artworks         Artwork[]
  applications     Application[]
}

Opportunity {
  id           String   @id @default(cuid())
  title        String
  description  String
  organizer    String
  location     String
  type         String   // grant, exhibition, residency, prize
  deadline     DateTime
  eligibility  String
  artTypes     String?  // comma-separated art types
  fee          String?
  prize        String?
}

Application {
  id              String   @id @default(cuid())
  status          String   @default("draft")
  artistStatement String?  // AI-generated
  coverLetter     String?  // AI-generated
  // Relationships
  artist          Artist
  opportunity     Opportunity
}
```

## 🤖 AI Features

### Matching Algorithm
The sophisticated matching system scores opportunities based on:
- **Location Matching** (30 points): Artist location vs opportunity location
- **Career Stage Alignment** (25 points): Eligibility requirements vs artist level
- **Artistic Medium Compatibility** (25 points): Medium focus vs opportunity art types
- **Opportunity Type Bonus** (10 points): Grant/exhibition/residency/prize weighting
- **Prize/Funding Availability** (10 points): Additional scoring for funded opportunities
- **Deadline Urgency**: Time-sensitive opportunity boosting

### Content Generation
AI-powered application materials using OpenAI GPT-4o-mini:
- **Artist Statements**: 300-500 word professional statements tailored to opportunities
- **Cover Letters**: Personalized cover letters with proper business formatting
- **Application Tips**: Contextual guidance for each application

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (for AI features)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/artmatch-app.git
   cd artmatch-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   ```
   
   Required environment variables:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

4. **Database setup**
   ```bash
   # Initialize database
   npx prisma db push
   
   # Seed with Australian opportunities
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Access at [http://localhost:3000](http://localhost:3000)

### Development Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with opportunities
```

## 🔒 Security Features

- **JWT Authentication**: Secure session management with NextAuth.js
- **Protected Routes**: Server-side authentication checks
- **Input Validation**: Form validation and sanitization
- **Environment Variables**: Secure configuration management
- **CORS Configuration**: Proper cross-origin resource sharing

## 🎨 UI/UX Design

### Design System
- **Typography**: Geist Sans and Geist Mono font families
- **Color Palette**: Blue-focused with complementary colors
- **Components**: Radix UI primitives with custom styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA labels and keyboard navigation support

### Key UI Components
- **Navigation**: Responsive header with authentication state
- **Dashboard**: Personalized opportunity grid with match scoring
- **Profile Setup**: 3-step wizard with progress indication
- **Application Generator**: Split-pane editor with tips sidebar

## 📈 Performance Optimizations

- **Server-Side Rendering**: Next.js SSR for improved performance
- **Image Optimization**: Next.js Image component with automatic optimization
- **Code Splitting**: Automatic code splitting with dynamic imports
- **Caching**: API route caching and Prisma query optimization
- **Bundle Analysis**: Webpack bundle analyzer for size monitoring

## 🔄 Data Flow

1. **User Authentication**: NextAuth.js handles sign-in/sign-up
2. **Profile Creation**: 3-step wizard captures artist information
3. **Opportunity Matching**: AI algorithm scores and ranks opportunities
4. **Application Generation**: OpenAI creates tailored application materials
5. **Application Management**: Users can edit, save, and track applications

## 🧪 Testing Strategy

### Testing Framework (To be implemented)
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing with Supertest
- **E2E Tests**: Playwright for full user journey testing
- **Type Checking**: TypeScript strict mode enabled

## 🚀 Deployment

### Recommended Deployment Stack
- **Platform**: Vercel (optimized for Next.js)
- **Database**: PostgreSQL (Supabase/PlanetScale)
- **AI Service**: OpenAI API
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

### Environment-Specific Configuration
```bash
# Development
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"

# Production
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/callback/credentials` - User authentication
- `GET /api/auth/session` - Get current session

### Profile Management
- `GET /api/profile` - Get artist profile
- `POST /api/profile` - Create/update artist profile

### Opportunities
- `GET /api/opportunities` - List all opportunities
- `GET /api/matches` - Get AI-matched opportunities

### Applications
- `POST /api/generate-application` - Generate AI application
- `GET /api/applications/[id]` - Get application details

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit using conventional commits: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Testing improvements
- `chore:` - Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/your-username/artmatch-app/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/artmatch-app/wiki)
- **Community**: [Discussions](https://github.com/your-username/artmatch-app/discussions)

## 🙏 Acknowledgments

- Australian arts organizations for opportunity data
- OpenAI for AI-powered content generation
- Next.js and Vercel teams for the excellent framework
- The Australian arts community for inspiration

---

**Built with ❤️ for the Australian arts community**
