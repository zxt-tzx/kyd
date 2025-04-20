import { useAgent } from "agents/react";
import { useRef, useState } from "react";

import { getAgentClientFetchOpts, type AgentState } from "@/core/agent/shared";
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
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>({
    status: "inactive",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const agent = useAgent({
    ...getAgentClientFetchOpts({
      nanoId,
      stage: sstStage,
    }),
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
      setAgentState(newState);
      setIsLoading(false);
      setErrorMessage(null);
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

  const elapsedTime = 0;
  // Helper function to get subtitle text based on agent status
  const getSubtitleText = () => {
    const { status } = agentState;
    switch (status) {
      case "inactive":
        return "Please check your URL.";
      case "running":
        return `Time since research started: ${elapsedTime} seconds.`;
      case "complete":
        return "Here is what we know about your dev:";
      default:
        status satisfies never;
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
              className={`mr-2 size-3 rounded-full ${
                isLoading
                  ? "bg-amber-500"
                  : isConnected
                    ? "bg-green-500"
                    : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {isLoading
                ? "Connecting..."
                : isConnected
                  ? "Connected to server"
                  : "Disconnected"}
            </span>
          </div>

          {/* Research Steps */}
          {agentState.status !== "inactive" && agentState.steps.length > 0 && (
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
        </div>
      </div>
    ),
  };
}
