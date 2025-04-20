import { useAgent } from "agents/react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  AgentStateSchema,
  getAgentClientFetchOpts,
  type AgentState,
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
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState>({
    status: "inactive",
  });
  const _agent = useAgent({
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
    onStateUpdate: (newState: unknown) => {
      const result = AgentStateSchema.safeParse(newState);
      if (result.success) {
        setAgentState(result.data);
        setErrorMessage(null);
      } else {
        setErrorMessage("Agent state validation failed");
        // Optionally log result.error for debugging
      }
      setIsLoading(false);
    },
  });
  // Return loading, error and component state alongside the JSX
  return {
    isLoading,
    errorMessage,
    isConnected,
    agentStatus: agentState.status,
    component: (
      <div className="relative flex w-full justify-center pt-28">
        <div className="w-full max-w-screen-xl px-4 text-center">
          {/* Render based on agentState.status */}
          {agentState.status === "inactive" && <InactiveAgentResult />}
          {agentState.status === "running" && agentState.initInfo && (
            <RunningAgentResult
              initiatedAt={agentState.initInfo.initiatedAt}
              steps={agentState.steps}
            />
          )}
          {agentState.status === "complete" && (
            <CompleteAgentResult steps={agentState.steps} />
          )}

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
        </div>
      </div>
    ),
  };
}

function InactiveAgentResult() {
  return (
    <>
      <h1 className="mb-8 font-mono text-5xl tracking-tight">
        Inactive Research Agent
      </h1>
      <h2 className="mb-8 text-xl text-gray-600">Please check your URL</h2>
    </>
  );
}

function RunningAgentResult({
  initiatedAt,
  steps,
}: {
  initiatedAt: string | number | Date;
  steps: Array<{ title: string; thoughts: string; context: string }>;
}) {
  const [elapsedTime, setElapsedTime] = useState(() => {
    const start = new Date(initiatedAt).getTime();
    return Math.floor((Date.now() - start) / 1000);
  });

  useEffect(() => {
    const start = new Date(initiatedAt).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [initiatedAt]);

  return (
    <>
      <h1 className="mb-8 font-mono text-5xl tracking-tight">
        Running Research…
      </h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Time since research started: {elapsedTime} seconds.
      </h2>
      <AgentSteps steps={steps} />
    </>
  );
}

function CompleteAgentResult({
  steps,
}: {
  steps: Array<{ title: string; thoughts: string; context: string }>;
}) {
  return (
    <>
      <h1 className="mb-8 font-mono text-5xl tracking-tight">
        Research Complete
      </h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Here is what we know about your dev
      </h2>
      <AgentSteps steps={steps} />
    </>
  );
}

function AgentSteps({
  steps,
}: {
  steps: Array<{ title: string; thoughts: string; context: string }>;
}) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="mx-auto mb-8 max-w-3xl">
      <h3 className="mb-4 text-2xl font-semibold">Research Steps</h3>
      <Accordion type="single" collapsible className="w-full">
        {steps.map((step, index) => (
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
  );
}
