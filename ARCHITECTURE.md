# ArtMatch Architecture Documentation

## 🏗️ System Architecture Overview

ArtMatch follows a modern **full-stack architecture** using Next.js 14 with the App Router, providing both frontend and backend capabilities in a single codebase.

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
├─────────────────────────────────────────────────────────┤
│  Next.js 14 App Router • React 18 • TypeScript • Tailwind
│  • Pages & Components • Authentication • State Management │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
├─────────────────────────────────────────────────────────┤
│           Next.js API Routes • RESTful APIs             │
│  • Authentication • Profile Management • AI Integration  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Business Logic                        │
├─────────────────────────────────────────────────────────┤
│  • AI Matching Algorithm • OpenAI Integration • Utils   │
│  • Data Processing • Validation • Error Handling        │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
├─────────────────────────────────────────────────────────┤
│     Prisma ORM • SQLite (Dev) • PostgreSQL (Prod)      │
│  • User Management • Opportunities • Applications       │
└─────────────────────────────────────────────────────────┘
```

## 📂 Detailed File Structure

### Root Directory
```
artmatch-app/
├── 📄 README.md                    # Project documentation
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 PROJECT_STATUS.md            # Current project status
├── 📄 ARCHITECTURE.md              # This file
├── 📄 LICENSE                      # MIT license
├── 📄 package.json                 # Node.js dependencies
├── 📄 tsconfig.json                # TypeScript configuration
├── 📄 tailwind.config.ts           # Tailwind CSS configuration
├── 📄 next.config.mjs              # Next.js configuration
├── 📄 postcss.config.mjs           # PostCSS configuration
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .env.example                 # Environment variables template
├── 📄 opportunities-data.csv       # Initial opportunity data
└── 📂 node_modules/                # Dependencies (ignored)
```

### Source Directory (`src/`)
```
src/
├── 📂 app/                         # Next.js App Router
│   ├── 📂 api/                     # API routes
│   │   ├── 📂 auth/
│   │   │   └── 📂 [...nextauth]/
│   │   │       └── route.ts        # NextAuth.js configuration
│   │   ├── 📂 profile/
│   │   │   └── route.ts            # Profile management API
│   │   ├── 📂 opportunities/
│   │   │   └── route.ts            # Opportunities API
│   │   ├── 📂 matches/
│   │   │   └── route.ts            # AI matching API
│   │   └── 📂 generate-application/
│   │       └── route.ts            # AI application generation
│   ├── 📂 auth/
│   │   └── 📂 signin/
│   │       └── page.tsx            # Sign-in page
│   ├── 📂 profile/
│   │   └── 📂 setup/
│   │       └── page.tsx            # Profile setup wizard
│   ├── 📂 dashboard/
│   │   └── page.tsx                # Artist dashboard
│   ├── 📂 opportunities/
│   │   └── page.tsx                # Opportunities browser
│   ├── 📂 application/
│   │   └── 📂 [id]/
│   │       └── page.tsx            # Application viewer/editor
│   ├── 📄 page.tsx                 # Home page
│   ├── 📄 layout.tsx               # Root layout
│   ├── 📄 globals.css              # Global styles
│   ├── 📄 favicon.ico              # Favicon
│   └── 📂 fonts/                   # Font files
├── 📂 components/                  # Reusable UI components
│   ├── 📄 Navigation.tsx           # Main navigation
│   └── 📄 SessionProvider.tsx      # Authentication provider
├── 📂 lib/                         # Utility functions & services
│   ├── 📄 prisma.ts                # Database client
│   ├── 📄 matching.ts              # AI matching algorithm
│   └── 📄 openai.ts                # OpenAI integration
└── 📂 types/                       # TypeScript definitions (future)
```

### Database Directory (`prisma/`)
```
prisma/
├── 📄 schema.prisma                # Database schema definition
├── 📄 seed.ts                      # Database seeding script
├── 📄 dev.db                       # SQLite database (ignored)
└── 📄 dev.db-journal               # SQLite journal (ignored)
```

## 🔧 Core Components Architecture

### 1. **Authentication System**
```typescript
// NextAuth.js Configuration
AuthOptions {
  providers: [CredentialsProvider]
  adapter: PrismaAdapter
  session: { strategy: 'jwt' }
  pages: { signIn: '/auth/signin' }
}

// Components
└── SessionProvider.tsx              # React Context for auth
└── Navigation.tsx                   # Auth-aware navigation
```

### 2. **Database Models**
```prisma
// Core Models
User ←→ Artist (1:1)
Artist ←→ Artwork (1:n)
Artist ←→ Application (1:n)
Opportunity ←→ Application (1:n)

// Supporting Models
Account, Session, VerificationToken  # NextAuth.js
```

### 3. **AI Integration Architecture**
```typescript
// Matching Algorithm
interface MatchingSystem {
  scoreOpportunityMatch(artist, opportunity): ScoredOpportunity
  getMatchedOpportunities(artist, opportunities): ScoredOpportunity[]
  getMatchDescription(score): string
}

// Content Generation
interface ContentGenerator {
  generateArtistStatement(artist, opportunity): Promise<string>
  generateCoverLetter(artist, opportunity): Promise<string>
  generateApplicationSummary(artist, opportunity): Promise<ApplicationData>
}
```

### 4. **API Layer Structure**
```typescript
// API Routes Pattern
├── /api/auth/[...nextauth]         # Authentication
├── /api/profile                    # GET, POST - Profile management
├── /api/opportunities              # GET - List opportunities
├── /api/matches                    # GET - AI-matched opportunities
└── /api/generate-application       # POST - Generate applications
```

## 🎨 UI/UX Architecture

### Design System
```typescript
// Styling Architecture
├── Tailwind CSS                    # Utility-first CSS
├── Radix UI Components             # Unstyled, accessible components
├── Geist Font Family               # Typography system
└── Custom Components               # Application-specific components

// Responsive Design
├── Mobile-first approach
├── Breakpoints: sm, md, lg, xl, 2xl
└── Flexible grid system
```

### Page Layout Structure
```typescript
// Layout Hierarchy
RootLayout (layout.tsx)
├── SessionProvider                 # Authentication context
├── Navigation                      # Global navigation
└── Page Components
    ├── Home (/)
    ├── Dashboard (/dashboard)
    ├── Profile Setup (/profile/setup)
    ├── Opportunities (/opportunities)
    ├── Applications (/application/[id])
    └── Authentication (/auth/signin)
```

## 🔄 Data Flow Architecture

### 1. **User Authentication Flow**
```
User Input → NextAuth.js → Database → JWT Token → Session State
```

### 2. **Profile Creation Flow**
```
Form Input → Validation → API Route → Prisma → Database → Response
```

### 3. **AI Matching Flow**
```
User Profile → Matching Algorithm → Scored Opportunities → Dashboard Display
```

### 4. **Application Generation Flow**
```
User Request → OpenAI API → Generated Content → Database Storage → UI Display
```

## 🚀 Performance Architecture

### Optimization Strategies
```typescript
// Next.js Optimizations
├── Server-Side Rendering (SSR)
├── Static Site Generation (SSG)
├── Automatic Code Splitting
├── Image Optimization
└── Bundle Analysis

// Database Optimizations
├── Prisma Query Optimization
├── Database Indexing
├── Connection Pooling
└── Query Caching
```

### Caching Strategy
```typescript
// Caching Layers
├── Browser Cache (Static Assets)
├── Next.js Cache (Pages & API Routes)
├── Database Query Cache (Prisma)
└── AI Response Cache (Future)
```

## 🔒 Security Architecture

### Authentication & Authorization
```typescript
// Security Measures
├── JWT Session Management
├── Protected API Routes
├── Input Validation
├── Environment Variables
└── CORS Configuration

// Future Security Enhancements
├── Rate Limiting
├── CSRF Protection
├── Input Sanitization
└── Security Headers
```

## 📊 Data Architecture

### Database Schema Design
```prisma
// Entity Relationships
User {
  id: String @id @default(cuid())
  email: String @unique
  ← Artist (1:1)
}

Artist {
  id: String @id @default(cuid())
  bio: String?
  location: String?
  careerStage: String?
  → User (1:1)
  ← Artwork[] (1:n)
  ← Application[] (1:n)
}

Opportunity {
  id: String @id @default(cuid())
  title: String
  description: String
  deadline: DateTime
  ← Application[] (1:n)
}

Application {
  id: String @id @default(cuid())
  status: String @default("draft")
  artistStatement: String?
  coverLetter: String?
  → Artist (n:1)
  → Opportunity (n:1)
}
```

## 🧪 Testing Architecture

### Testing Strategy (Planned)
```typescript
// Testing Pyramid
├── Unit Tests (Jest + React Testing Library)
├── Integration Tests (API Routes)
├── End-to-End Tests (Playwright)
└── Performance Tests (Lighthouse CI)

// Test Coverage Goals
├── Utilities & Services: 90%+
├── Components: 80%+
├── API Routes: 85%+
└── Overall: 80%+
```

## 🚀 Deployment Architecture

### Production Stack
```
┌─────────────────────────────────────────────────────────┐
│                    CDN & Edge                           │
├─────────────────────────────────────────────────────────┤
│              Vercel Edge Network                        │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                 Application Layer                       │
├─────────────────────────────────────────────────────────┤
│            Vercel Serverless Functions                  │
│         Next.js 14 App Router Deployment               │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Database Layer                         │
├─────────────────────────────────────────────────────────┤
│        PostgreSQL (Supabase/PlanetScale)               │
│            Connection Pooling                           │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                External Services                        │
├─────────────────────────────────────────────────────────┤
│   OpenAI API • Email Service • File Storage • Analytics │
└─────────────────────────────────────────────────────────┘
```

## 🔄 CI/CD Architecture

### Deployment Pipeline (Planned)
```yaml
# GitHub Actions Workflow
├── Code Push → GitHub
├── Automated Testing
├── Type Checking
├── Build Process
├── Security Scanning
├── Database Migration
└── Deployment → Vercel
```

## 📈 Monitoring Architecture

### Observability Stack (Planned)
```typescript
// Monitoring Components
├── Error Tracking (Sentry)
├── Performance Monitoring (Vercel Analytics)
├── User Analytics (Plausible/Google Analytics)
├── Database Monitoring (Prisma Metrics)
└── API Monitoring (Custom Metrics)
```

## 🔮 Future Architecture Considerations

### Scalability Enhancements
```typescript
// Horizontal Scaling
├── Microservices Architecture
├── Database Sharding
├── CDN Optimization
├── Cache Layers
└── Load Balancing

// Feature Additions
├── Real-time Notifications (WebSocket)
├── File Upload System (S3/CloudFlare)
├── Advanced Search (Elasticsearch)
├── Mobile App (React Native)
└── Public API (REST/GraphQL)
```

---

**Architecture Last Updated**: Current Version
**Next Architecture Review**: Upon Phase 2 Completion