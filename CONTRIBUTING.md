# Contributing to ArtMatch

Thank you for your interest in contributing to ArtMatch! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- OpenAI API key (for AI features)

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/artmatch-app.git`
3. Install dependencies: `npm install`
4. Copy environment variables: `cp .env.example .env`
5. Set up database: `npx prisma db push && npm run db:seed`
6. Start development server: `npm run dev`

## 📋 Development Workflow

### Branch Naming
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Testing improvements
- `chore/` - Maintenance tasks

### Commit Convention
We use [Conventional Commits](https://conventionalcommits.org/) for clear commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without changing functionality
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks, dependencies, build process

**Examples:**
```bash
feat: add portfolio upload functionality
fix: resolve authentication session timeout
docs: update API documentation
refactor: extract matching algorithm to service
test: add unit tests for AI matching system
chore: update dependencies to latest versions
```

## 🏗️ Code Standards

### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type - use proper typing
- Use strict mode configuration

### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Use Next.js App Router patterns
- Follow React best practices for performance

### Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use Radix UI components when possible
- Maintain consistent spacing and typography

### API Design
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Document API endpoints

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Guidelines
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write component tests for React components
- Maintain test coverage above 80%

## 🔍 Code Review Process

### Pull Request Guidelines
1. **Clear Description**: Explain what changes were made and why
2. **Issue Reference**: Link to related issues using `closes #123`
3. **Testing**: Include test results and manual testing steps
4. **Screenshots**: Include UI changes with before/after screenshots
5. **Documentation**: Update documentation if needed

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 📁 Project Structure

### Directory Organization
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── (auth)/         # Authentication routes
│   └── (dashboard)/    # Dashboard routes
├── components/         # Reusable UI components
├── lib/               # Utility functions and services
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── styles/            # Global styles
```

### File Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase starting with `use` (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`User.ts`)
- **API Routes**: kebab-case (`user-profile.ts`)

## 🔧 Development Tools

### Recommended VS Code Extensions
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prisma
- ESLint
- Prettier

### Code Formatting
- Use Prettier for code formatting
- Configure ESLint for code quality
- Use TypeScript strict mode
- Follow Airbnb style guide

## 🚨 Issue Reporting

### Bug Reports
Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, Node.js version)
- Screenshots or console logs
- Minimal reproducible example

### Feature Requests
Include:
- Clear description of the feature
- Use cases and benefits
- Mockups or wireframes (if applicable)
- Implementation suggestions

## 📚 Documentation

### Code Documentation
- Use JSDoc for function documentation
- Document complex algorithms and business logic
- Include examples in documentation
- Keep README.md updated

### API Documentation
- Document all endpoints
- Include request/response examples
- Specify authentication requirements
- Document error responses

## 🌟 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project README.md
- Release notes for significant contributions

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Discord**: [Join our community](https://discord.gg/artmatch) (if applicable)

## 📄 License

By contributing to ArtMatch, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ArtMatch! Your efforts help make the Australian arts community more connected and supported. 🎨