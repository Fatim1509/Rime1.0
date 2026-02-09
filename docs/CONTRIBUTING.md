# Contributing to RIME

Thank you for your interest in contributing to RIME!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone <your-fork>`
3. Run setup: `./scripts/setup.sh`
4. Create a branch: `git checkout -b feature/your-feature`

## Code Style

### TypeScript
- Use TypeScript strict mode
- Prefer `const` over `let`
- Use async/await over promises
- Add JSDoc comments for public APIs

### Python
- Follow PEP 8
- Use type hints
- Add docstrings for functions

### React
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for props

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test

# Run with coverage
npm test -- --coverage
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit PR with clear description

## Code Review

- Be respectful and constructive
- Respond to feedback promptly
- Keep PRs focused and small

## Questions?

Open an issue or join our Discord: discord.gg/rime
