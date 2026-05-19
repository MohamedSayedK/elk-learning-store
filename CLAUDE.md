# Claude Code — Project Instructions

## Memory

Project memory lives in `.claude/memory/`. Read `MEMORY.md` there at the start of every session.
Update memory files as new preferences or project decisions are made.

## Code style for this project

This is a **learning project**. Override normal "no comments" defaults:

- Every file gets an opening block explaining what technology it demonstrates and why it exists
- Every non-obvious line gets an inline comment explaining the concept
- Comments teach the WHY, not the WHAT

## After each completed issue

End the response with a **"What to look at"** section:
- Exact URLs to visit
- Exact CLI commands to run
- What to watch for / what to expect to see

## Build order

Issues are built sequentially — one layer at a time, each demonstrable before the next:

1. ✅ Monorepo scaffold + Docker Compose
2. ✅ PostgreSQL schema + seed data
3. Products endpoints (N+1 demo)
4. Auth (JWT + Redis sessions)
5. Orders endpoint
6. Redis caching layer
7. RabbitMQ 3-step pipeline
8. NestJS health endpoint
9. Angular store UI
10. ELK stack integration
11. Angular admin dashboard

## Session decisions

- **Domain:** Mobile Device Store (devices, variants by color + storage, orders)
- **PRD:** `PRD.md` at root
- **GitHub issues:** 11 issues created at https://github.com/MohamedSayedK/elk-learning-store/issues
- **Build style:** Layer by layer, each demonstrable before next
- **Comments:** Dense — every file explains WHY the technology exists, not just what the code does
- **After each issue:** "What to look at" section with exact URLs + commands
- **redis-cli:** Installed globally via winget at `C:\Program Files\Redis\redis-cli.exe`
- **Docker issue:** `version` attribute removed from docker-compose.yml (was obsolete, caused warning)
- **ELK order:** Angular store UI (#9) built before ELK integration (#10) per user preference

## GitHub repo

https://github.com/MohamedSayedK/elk-learning-store
