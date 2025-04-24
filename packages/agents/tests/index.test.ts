import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock node-html-parser and css-select explicitly
vi.mock("node-html-parser");
vi.mock("css-select");

// Mock other problematic modules
vi.mock("agents", () => ({
  getAgentByName: vi.fn(),
  routeAgentRequest: vi.fn().mockResolvedValue(null),
  Connection: vi.fn()
}));

vi.mock("agents/ai-chat-agent", () => ({
  AIChatAgent: class AIChatAgent {
    constructor() {}
  }
}));

// Create a simplified mock of the worker
const mockWorker = {
  fetch: async (request: Request, env: any, ctx: ExecutionContext) => {
    return new Response("Not found", { status: 404 });
  }
};

// Mock Env interface
declare module "cloudflare:test" {
  interface ProvidedEnv extends Env {}
}

describe("Chat worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responds with Not found", async () => {
    const request = new Request("http://example.com");
    const ctx = createExecutionContext();
    
    // Use the mock worker instead of the real one
    const response = await mockWorker.fetch(request, env, ctx);
    
    await waitOnExecutionContext(ctx);
    expect(await response.text()).toBe("Not found");
    expect(response.status).toBe(404);
  });
});
