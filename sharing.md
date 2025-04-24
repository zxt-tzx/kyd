# Demo at AI Tinkerers Demo

## About Me

- Full-stack TypeScript web developer, ex-OGP
- Quit my job to focus on AI
- Big fan of serverless constructs, bullish on AI applications
- I want to build an AI agent and get a sense of the state-of-the-art

## Problems with managing state in AI agents

- AI agents are _sui generis_ and does not fit existing paradigms
  - does NOT fit request/response paradigm. Takes a while to complete.
  - NOT a purely asynchronous task. You may want to display progress on frontend and build human-in-the-loop
- AI agents are stateful
  - If run on a stateless backend, then you need to constantly sync progress back to the database, which is painful and error-prone
  - Even if clients go offline or lose connection, the agent should continue its work. Who among us (esp during the Ghiblifyin images fad) has not experienced a failed OpenAI request because we closed our clients?
  - Ideally, support multiple clients

There is a lot of progress in AI agentic frameworks re: orchestrating stateful agents (LangGraph, Mastra, CrewAI etc.). However, they do not make it easy to expose these agents to the frontend. When I looked into this, I realized Cloudflare Agent SDK is an interesting option: it is agnostic as to how you orchestrate your agent, but it provides useful infra to tie your frontend + backend + agent.

## Tech stack

I prefer to keep everything in a TypeScript monorepo as far as possible:

- Frontend: Vite React + Tanstack Router
- Backend: Hono, deployed on AWS Lambda
- Database: Postgres via Drizzle
- LLM: Vercel AI SDK, OpenAI API
- Agent: Cloudflare AI Agent SDK (deployed on Durable Objects)

## How it works

User goes on frontend and keys in the dev's GitHub URL + any custom prompt.

The backend:

- Creates an entry in the database (centralized source-of-truth)
- Initializes the agent using a POST request with a secret in the header
- Returns response to the frontend

The user then is redirected to a page that connects to the agent directly via WebSocket. In other words, everything you see here is state within the agent and, whenever the agent's state change, it is immediately reflected on the frontend.

The agent:

- After being initialized, it updates its own state to `running` and triggers the research.
- In the course of the research, we track two kinds of states
  - `this.log`: the log that the user sees while the AI agent is running
  - `this.findings`: in the course of research, relevant findings are dumped here
- When the agent reaches the end of its research, it calls a large reasoning model to generate the report. When it is done, it updates its own state to `complete`.

### Cool stuff

- End-to-end type safety
- Agent is just TypeScript code
