import { agentFetch } from "agents/client";
import { useAgent } from "agents/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import {
  getAgentClientFetchOpts,
  type AgentState,
  type Message,
} from "@/core/agent/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ResearchResultProps {
  nanoId: string;
}

const sstStage = import.meta.env.VITE_SST_STAGE;

export function ResearchResult({ nanoId }: ResearchResultProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>({
    status: "inactive",
    initialPrompt: "",
    steps: [],
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
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
    onOpen: () => {
      setIsConnected(true);
      setIsLoading(false);
      setErrorMessage(null);
    },
    onClose: () => setIsConnected(false),
    onError: (event) => {
      const message =
        event instanceof ErrorEvent ? event.message : "Something went wrong";
      setErrorMessage(message);
      setIsLoading(false);
    },
    onStateUpdate: (newState: AgentState) => {
      // Type assertion to ensure compatibility with our state type
      setAgentState(newState);
      setIsLoading(false);
      setErrorMessage(null);

      // Set start time when agent starts running
      if (newState.status === "running" && !startTime) {
        setStartTime(new Date());
      }
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

  // Calculate elapsed time since research started
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (agentState.status === "running" && startTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000,
        );
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [agentState.status, startTime]);

  // Helper function to get title text based on agent status
  const getTitleText = () => {
    switch (agentState.status) {
      case "inactive":
        return "Inactive Research Agent";
      case "running":
        return "Running Research…";
      case "complete":
        return "Research Complete";
      default:
        return "Research Agent";
    }
  };

  // Helper function to get subtitle text based on agent status
  const getSubtitleText = () => {
    switch (agentState.status) {
      case "inactive":
        return "Please check your URL.";
      case "running":
        return `Time since research started: ${elapsedTime} seconds.`;
      case "complete":
        return `Research completed in ${elapsedTime} seconds.`;
      default:
        return "";
    }
  };

  // Return loading, error and component state alongside the JSX
  return {
    isLoading,
    errorMessage,
    isConnected,
    agentState,
    component: (
      <div className="relative flex w-full justify-center pt-28">
        <div className="w-full max-w-screen-xl px-4 text-center">
          <h1 className="mb-8 font-mono text-5xl tracking-tight">
            {getTitleText()}
          </h1>
          <h2 className="mb-8 text-xl text-gray-600">{getSubtitleText()}</h2>

          {/* Connection status indicator */}
          <div className="mb-8 flex items-center justify-center">
            <div
              className={`mr-2 size-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Connected to server" : "Disconnected"}
            </span>
          </div>

          {/* Initial Prompt */}
          {agentState.initialPrompt && (
            <Card className="mx-auto mb-8 max-w-2xl">
              <CardHeader>
                <CardTitle>Initial Research Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-left text-gray-700">
                  {agentState.initialPrompt}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Research Steps */}
          {agentState.steps.length > 0 && (
            <div className="mx-auto mb-8 max-w-3xl">
              <h3 className="mb-4 text-2xl font-semibold">Research Steps</h3>
              <Accordion type="single" collapsible className="w-full">
                {agentState.steps.map((step, index) => (
                  <AccordionItem key={index} value={`step-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      Step {index + 1}: {step.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardHeader>
                          <CardTitle>Thoughts</CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-left">
                          {step.thoughts}
                        </CardContent>
                      </Card>

                      {step.context && (
                        <Card className="mt-4">
                          <CardHeader>
                            <CardTitle>Context</CardTitle>
                          </CardHeader>
                          <CardContent className="whitespace-pre-wrap text-left">
                            {step.context}
                          </CardContent>
                        </Card>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Messages section */}
          <div className="mx-auto mb-8 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Communication with the research agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === "incoming"
                              ? "bg-gray-200 text-gray-800"
                              : "ml-auto bg-blue-500 text-white"
                          }`}
                        >
                          <div className="break-words text-left">
                            {message.text}
                          </div>
                          <div
                            className={`mt-1 text-xs ${message.type === "incoming" ? "text-gray-500" : "text-blue-100"}`}
                          >
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Message form */}
                <form className="mt-4 flex" onSubmit={handleSubmit}>
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
              </CardContent>
            </Card>
          </div>

          {/* HTTP Request button */}
          <div className="mx-auto max-w-md">
            <button
              type="button"
              onClick={handleFetchRequest}
              className="w-full rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400/50"
            >
              Send HTTP Request
            </button>
          </div>
        </div>
      </div>
    ),
  };
}
