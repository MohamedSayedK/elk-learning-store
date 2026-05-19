---
name: feedback_learning_style
description: "User wants heavy comments and logging in ELK learning project, plus a \"what to look at\" hint after each completed issue"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8157c895-4573-4a59-a490-6e45936fed48
---

Add dense explanatory comments to every file in this project — explain WHY each pattern exists, not just what the code does. This is a learning project, not production code.

**Why:** User is learning ELK, Redis, RabbitMQ, PostgreSQL query optimization from scratch. Comments are the primary teaching mechanism alongside running code.

**How to apply:**
- Every module, service, class: opening comment block explaining what technology it demonstrates and why it exists
- Every non-obvious line or config: inline comment explaining the concept (e.g. "// TTL = Time To Live — Redis auto-deletes this key after 5 minutes")
- After finishing each issue, end the response with a "What to look at" section showing exactly how to observe/test what was just built (URLs, commands, what to watch for)
