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
2. PostgreSQL schema + seed data
3. Products endpoints (N+1 demo)
4. Auth (JWT + Redis sessions)
5. Orders endpoint
6. Redis caching layer
7. RabbitMQ 3-step pipeline
8. NestJS health endpoint
9. Angular store UI
10. ELK stack integration
11. Angular admin dashboard

## GitHub repo

https://github.com/MohamedSayedK/elk-learning-store
