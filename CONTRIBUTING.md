# Contributing to AI CEO Clone

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aiceoclone.git
   cd aiceoclone
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies:**
   ```bash
   npm install
   ```

## Development Setup

### Video Rendering (Remotion)

```bash
npm install
npm run preview    # Opens Remotion Studio at localhost:3000
```

Requires Node.js 18+ and Python 3.8+ (for TTS audio generation).

### Platform API

```bash
cd platform/api
npm install
npm run dev        # Starts Express server with hot reload
npm test           # Runs vitest suite
```

### Dashboard

```bash
cd platform/dashboard
npm install
npm run dev        # Starts Vite dev server
npm run lint       # Runs ESLint
```

### Docker Pipeline

```bash
cd docker
cp .env.example .env   # Add your API key
docker compose build
docker compose up -d
```

## What to Contribute

### Good First Issues

Look for issues labeled [`good first issue`](https://github.com/QuietSentinelShadow/aiceoclone/labels/good%20first%20issue). These are scoped and well-documented.

### Areas Where Help is Needed

- **Tests** — The API has minimal test coverage. Integration tests for auth routes, instance CRUD, and Docker service mocking would be valuable.
- **Accessibility** — The site pages and dashboard could use ARIA improvements and keyboard navigation.
- **Documentation** — Tutorials, translations, or improving existing guides.
- **New video compositions** — Creating Remotion videos for Docker setup, SaaS platform, or security topics.
- **Pack definitions** — Adding new NullClaw instance packs for different use cases.
- **Dashboard features** — Usage analytics, instance metrics, log search/filtering.

## Making Changes

### Code Style

- **TypeScript** for all API and dashboard code
- **React functional components** with hooks (no class components)
- **Tailwind CSS** for styling (dashboard and site pages)
- Follow existing patterns — look at similar files before writing new code
- No unnecessary abstractions — keep it simple

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(scope): add new feature
fix(scope): fix a bug
docs: update documentation
chore: maintenance task
refactor(scope): code restructure without behavior change
test(scope): add or update tests
```

Scopes: `docker`, `platform`, `dashboard`, `security`, `site`, `video`

Examples:
```
feat(dashboard): add instance search filtering
fix(platform): handle Docker socket connection timeout
docs: add API authentication examples to README
test(platform): add integration tests for auth routes
```

### Branching

- `master` is the production branch (deployed to GitHub Pages)
- Create feature branches from `master`: `feature/your-feature`
- Create bugfix branches from `master`: `fix/issue-description`

## Pull Request Process

1. **Update documentation** if your change affects setup, usage, or API behavior
2. **Run tests** before submitting:
   ```bash
   cd platform/api && npm test
   cd platform/dashboard && npm run build
   ```
3. **Keep PRs focused** — one feature or fix per PR
4. **Write a clear description** explaining what changed and why
5. **Link related issues** using `Closes #123` in the PR description

### PR Template

```markdown
## Summary
Brief description of changes.

## Changes
- What was added/modified/removed

## Testing
- How you tested the changes
- Any manual testing steps for reviewers

## Screenshots
If applicable, add screenshots of UI changes.
```

## Reporting Bugs

Open an [issue](https://github.com/QuietSentinelShadow/aiceoclone/issues/new) with:

- **Description** of the bug
- **Steps to reproduce** (be specific)
- **Expected behavior** vs **actual behavior**
- **Environment** (OS, Node.js version, Docker version, browser)
- **Screenshots or logs** if applicable

## Requesting Features

Open an [issue](https://github.com/QuietSentinelShadow/aiceoclone/issues/new) with:

- **Description** of the feature
- **Use case** — why is this needed?
- **Proposed solution** (optional but helpful)

## Project Architecture

Understanding the codebase:

| Directory | Purpose | Key Tech |
|-----------|---------|----------|
| `src/` | Remotion video compositions and shared components | React, Remotion |
| `scripts/` | Audio generation and video rendering automation | Node.js, edge-tts |
| `blog/` | Static HTML article | Tailwind CSS |
| `slideshow/` | Presentation slides | Reveal.js |
| `docker/` | NullClaw container pipeline and tutorial page | Docker, Compose |
| `platform/api/` | REST API for instance management | Express v5, SQLite |
| `platform/dashboard/` | Web UI for managing NullClaw instances | React 19, Vite |
| `platform/packs/` | Instance pack definitions (JSON) | - |
| `security/` | Security best practices guide page | HTML |
| `saas/` | SaaS architecture guide page | HTML |
| `sample-configs/` | Example NullClaw configurations | JSON |

## Questions?

Open a [discussion](https://github.com/QuietSentinelShadow/aiceoclone/discussions) or reach out via issues.

Thank you for helping make AI CEO Clone better!
