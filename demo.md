# AI Tinkerers Demo on 25 Apr 2025

## About Me

- Full-stack TypeScript, ex-OGP. [GitHub](https://github.com/zxt-tzx), [LinkedIn](https://www.linkedin.com/in/tan-zixiang/)
- Quit my job to explore opportunities in AI
- Big fan of serverless, bullish on AI applications
- For this project, I want to build a working AI agent and get a sense of how the different pieces fit together in a web app

## Tech stack

I prefer to keep everything in a TypeScript monorepo as far as possible:

- Frontend: Vite React + Tanstack Router
- Backend: Hono, deployed on AWS Lambda
- Database: Postgres
- LLM: Vercel AI SDK, OpenAI models
- Agent: Cloudflare AI Agent SDK

## How it works

User goes on frontend and enters the dev's GitHub URL and an optional prompt.

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

## Why is this interesting?

### Problems with managing state in AI agents

- AI agents do not fit existing paradigms
  - Does not fit request/response paradigm. Takes a while to complete.
  - Not really an asynchronous task either; you may want to have human-in-the-loop (HITL) or otherwise expose progress to the frontend
- AI agents are stateful
  - If run on a stateless backend, then you need to sync your state back to your database all the time. This is painful and error-prone.
  - Even if clients go offline or lose connection, the agent should continue its work. Who among us (esp during the Studio Ghibli image generation fad) has not experienced a failed OpenAI request because our client lost the connection with the server?

### What about existing agent frameworks?

When I tried to create this AI agent on the web, I realized most AI agent frameworks focus on agent design. That is, they ask questions like:

- What is the right level of abstraction for agents?
  - High level: easy to get started
  - Low level: fine-grained control
- How to orchestrate agents? Crews or graphs? Agents or workflows? Declarative or imperative?
- Which features? E.g. multi-agents, HITL, studio, memory storage etc.

As an application developer, my goal is more mundane:

- I want to build an MVP on the web
- I want an agent whose progress I can expose to the frontend (most frameworks do not help with this)
- I want my agent to integrate nicely with my existing tech stack (sharing code, using existing cloud providers). Slightly worrying that many framework companies make money by selling you a hosted solution. I don't want to have another SaaS to worry about

### Enter: Cloudflare Agent SDK

And that is when I found Cloudflare Agent SDK:

- It make uses of Cloudflare's Durable Objects to create a stateful agent, which clients can connect to directly
- Agnostic as to how you orchestrate your agent. I just used Vercel AI SDK directly, but conceivably I could use the more full-featured frameworks too
- Most likely, you are already using Cloudflare for the DNS. Durable Objects [are recently added to the free tier](https://developers.cloudflare.com/changelog/2025-04-07-durable-objects-free-tier/).
- TypeScript-first, so I can integrate it nicely into my monorepo

#### Brief aside on Durable Objects

- Each DO has a globally unique name, so all requests with the same name are routed to the same object
- Storage colocated with compute. Each DO has a durable SQLite database that can store up to 10GB and has single-threaded concurrency. Think "serverless horizontally distributed state".
- Alarms API that allows you to schedule the Durable Object to be woken up at a time in the future

#### Back to Cloudflare Agent SDK

Cool stuff this enables:

- Shared code throughout monorepo.
- End-to-end type safety.
- Agent is just a JavaScript class. Back to OOP.
  - You can run a for-loop or use an actual agentic framework to program the agent.
  - Confession: I used Vercel AI SDK to run what is strictly a linear rather than agentic workflow.
  - But it's surprisingly easy to create an agent. [See this](https://aie-feb-25.vercel.app/docs).
- Other nice features
  - Scheduling tasks to run at a specified time in the future
  - SQL API to write to the embedded SQLite database directly
  - Specific abstractions for building interactive chat agents (I have not had the chance to explore this fully)

That said, it's not all sunshine ☀️ and rainbows 🌈:

- Cloudflare Agent SDK is fairly new (released on 25 Feb 2025)
  - Still being worked upon, there are rough edges
  - Docs and examples could be more comprehensive
- An agent's state is public, so if there is state you wish to keep "private" from the clients, you will need to use the [SQL API](https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/#sql-api)
- You have to deal with problems of distributed state
  - Syncing state back to database
  - Data migration when you change the schema of your DO

#### Last word on Cloudflare

- In general, would not recommend full-stack Cloudflare.
  - Compared to traditional cloud providers (AWS, GCP), it's not as mature
  - Fully serverless + global stack is probably still a dream (especially for storage layer)
- Cloudflare has many interesting, LLM-relevant products:
  - Durable Objects is very interesting
    - Billed for compute only when DO is active ("serverless")
    - Cloudflare prices are generally quite competitive as they own their own infra
  - Possibilities unlocked by DO:
    - Remote MCP. [Blog post](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/), [prototype by Sentry](https://github.com/getsentry/sentry-mcp).
    - ["1 database per user" pattern](https://boristane.com/blog/durable-objects-database-per-user/)
  - Cloudflare Workflow is now GA; interesting take on Durable Execution

See this [blog post](https://sunilpai.dev/posts/cloudflare-workers-for-ai-agents/) for more Cloudflare x AI shilling.

## Further Exploration

- Build a full-fledged, interactive agent with human-in-the-loop UX and more extensive tool use
- If you're building something cool, hit me up!
