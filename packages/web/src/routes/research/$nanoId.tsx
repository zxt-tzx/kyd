import { createFileRoute } from "@tanstack/react-router";
import { agentFetch } from "agents/client";
import { useAgent } from "agents/react";
import type React from "react";
import { useRef, useState } from "react";

import {
  getAgentClientFetchOpts,
  type AgentState,
  type Message,
} from "@/core/agent/shared";
import { ApiError } from "@/lib/api/client";

const sstStage = import.meta.env.VITE_SST_STAGE;

export const Route = createFileRoute("/research/$nanoId")({
  component: AgentView,
  pendingComponent: () => <AgentViewSkeleton />,
  errorComponent: ({ error }: { error: unknown }) => {
    if (error instanceof ApiError && error.code === 404) {
      return <NotFoundView />;
    }
    return <ErrorView error={error} />;
  },
});

function AgentViewSkeleton() {
  return (
    <div className="relative flex w-full justify-center pt-8">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header with loading state */}
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-300"></div>
        </div>

        {/* Status indicator skeleton */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 p-3">
          <div className="mr-2 size-3 rounded-full bg-gray-300" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-300"></div>
        </div>

        {/* Messages section skeleton */}
        <div className="h-64 overflow-y-auto bg-gray-50 p-4">
          <div className="mb-3 h-6 w-24 animate-pulse rounded bg-gray-300"></div>
          <div className="space-y-3">
            <div className="h-16 w-3/4 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="ml-auto h-16 w-3/4 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-16 w-3/4 animate-pulse rounded-lg bg-gray-300"></div>
          </div>
        </div>

        {/* Message form skeleton */}
        <div className="flex border-t border-gray-200 p-3">
          <div className="h-10 flex-1 animate-pulse rounded-l-md bg-gray-300"></div>
          <div className="h-10 w-16 animate-pulse rounded-r-md bg-gray-300"></div>
        </div>

        {/* HTTP Request button skeleton */}
        <div className="border-t border-gray-200 p-3">
          <div className="h-10 w-full animate-pulse rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-xl px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Research Not Found
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          The research you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <a
          href="/"
          className="inline-block rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

function ErrorView({ error }: { error: unknown }) {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";

  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-xl px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Something Went Wrong
        </h1>
        <div className="mx-auto mb-8 max-w-md">
          <p className="mb-4 text-xl text-gray-600">
            We encountered an error while processing your request.
          </p>
          <div className="mb-8 rounded-md bg-red-50 p-4 text-left">
            <p className="font-mono text-red-700">{errorMessage}</p>
          </div>
          <a
            href="/"
            className="inline-block rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

function AgentView() {
  const { nanoId } = Route.useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>({
    status: "inactive",
    initialPrompt: "",
    steps: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const agent = useAgent({
    ...getAgentClientFetchOpts({
      nanoId,
      stage: sstStage,
    }),
    onMessage: (message) => {
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: message.data as string,
        timestamp: new Date(),
        type: "incoming",
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    startClosed: true,
    onOpen: () => {
      setIsConnected(true);
      setIsLoading(false);
    },
    onClose: () => setIsConnected(false),
    onError: () => {
      setIsError(true);
      setIsLoading(false);
    },
    onStateUpdate: (newState: AgentState) => {
      // Type assertion to ensure compatibility with our state type
      setAgentState(newState);
      setIsLoading(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current || !inputRef.current.value.trim()) return;

    const text = inputRef.current.value;
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text,
      timestamp: new Date(),
      type: "outgoing",
    };

    agent.send(text);
    setMessages((prev) => [...prev, newMessage]);
    inputRef.current.value = "";
  };

  const handleFetchRequest = async () => {
    try {
      const response = await agentFetch(
        getAgentClientFetchOpts({
          nanoId,
          stage: sstStage,
        }),
      );
      const data = await response.text();
      const newMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: `Server Response: ${data}`,
        timestamp: new Date(),
        type: "incoming",
      };
      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Error fetching from server:", error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  console.log({
    isLoading,
    isConnected,
  });
  // Show loading screen while connecting to websocket
  if (isLoading) {
    return <AgentViewSkeleton />;
  }

  // Show NotFoundView if connected but agent is inactive
  if (isConnected && agentState.status === "inactive") {
    return <NotFoundView />;
  }

  return (
    <div className="relative flex w-full justify-center pt-8">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        {/* Header with research ID */}
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <h2 className="text-lg font-medium text-gray-700">
            Research: {nanoId}
          </h2>
        </div>

        {/* Status indicator - always visible, independent of loading state */}
        <div className="flex items-center border-b border-gray-200 bg-gray-50 p-3">
          <div
            className={`mr-2 size-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Connected to server" : "Disconnected"}
          </span>
        </div>

        {/* Agent Status and Prompt */}
        <div className="border-b border-gray-200 bg-gray-50 p-3">
          <div className="mb-2">
            <span className="font-medium text-gray-700">Status: </span>
            <span
              className={`${agentState.status === "running" ? "text-green-600" : agentState.status === "complete" ? "text-blue-600" : "text-gray-600"} text-sm`}
            >
              {agentState.status.charAt(0).toUpperCase() +
                agentState.status.slice(1)}
            </span>
          </div>
          {agentState.initialPrompt && (
            <div>
              <span className="font-medium text-gray-700">
                Initial Prompt:{" "}
              </span>
              <p className="mt-1 break-words text-sm text-gray-600">
                {agentState.initialPrompt}
              </p>
            </div>
          )}
        </div>

        {/* Messages section */}
        <div className="h-64 overflow-y-auto bg-gray-50 p-4">
          <h2 className="mb-3 text-lg font-medium text-gray-700">Messages</h2>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === "incoming"
                    ? "bg-gray-200 text-gray-800"
                    : "ml-auto bg-blue-500 text-white"
                }`}
              >
                <div className="break-words">{message.text}</div>
                <div
                  className={`mt-1 text-xs ${message.type === "incoming" ? "text-gray-500" : "text-blue-100"}`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message form */}
        <form
          className="flex border-t border-gray-200 p-3"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            ref={inputRef}
            className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Send
          </button>
        </form>

        {/* HTTP Request button */}
        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={handleFetchRequest}
            className="w-full rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50"
          >
            Send HTTP Request
          </button>
        </div>
      </div>
    </div>
  );
}
