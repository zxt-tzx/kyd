# CLAUDE.md file

## Monorepo notes and commands

- This is a monorepo created using `bun`
- typecheck: `bun typecheck`

## Tips

- Use Context7 MCP to get code snippets to understand library APIs (see `.mcp.json`)

## Code style

- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

## Final polishing before commit

- Run `bun check:all` and fix any errors
