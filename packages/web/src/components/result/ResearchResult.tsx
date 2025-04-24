import { useAgent } from "agents/react";
import { createContext, useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  AgentStateSchema,
  getAgentClientFetchOpts,
  type AgentState,
} from "@/core/agent/shared";
import { Card, CardContent } from "@/components/ui/card";
import { useCursorAnimation } from "@/hooks/useCursorAnimation";

interface ResearchResultProps {
  nanoId: string;
}

const sstStage = import.meta.env.VITE_SST_STAGE;

const ConnectionContext = createContext<{
  isConnected: boolean;
  isLoading: boolean;
} | null>(null);

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
      stage: sstStage!, // needed for CI to pass
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
      // State update received
      const result = AgentStateSchema.safeParse(newState);
      if (result.success) {
        setAgentState(result.data);
        setErrorMessage(null);
      } else {
        setErrorMessage(
          `Agent state validation failed: ${result.error.message}`,
        );
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
      <ConnectionContext.Provider value={{ isConnected, isLoading }}>
        <div className="relative flex w-full justify-center pt-28">
          <div className="w-full max-w-screen-xl px-4 text-center">
            {/* Render based on agentState.status */}
            {agentState.status === "inactive" && <InactiveAgentResult />}
            {agentState.status === "running" && (
              <RunningAgentResult
                title={agentState.title}
                initiatedAt={agentState.initiatedAt}
                log={agentState.log}
              />
            )}
            {agentState.status === "complete" && (
              <CompleteAgentResult
                title={agentState.title}
                report={agentState.report || ""}
              />
            )}
          </div>
        </div>
      </ConnectionContext.Provider>
    ),
  };
}

function InactiveAgentResult() {
  return (
    <>
      <h1 className="mb-8 text-5xl tracking-tight">Inactive Research Agent</h1>
      <h2 className="mb-8 text-xl text-gray-600">Please check your URL</h2>
    </>
  );
}

function RunningAgentResult({
  title,
  initiatedAt,
  log,
}: {
  title: string;
  initiatedAt: string | number | Date;
  log: string;
}) {
  const [elapsedTime, setElapsedTime] = useState(() => {
    const start = new Date(initiatedAt).getTime();
    return Math.floor((Date.now() - start) / 1000);
  });
  const { isConnected, isLoading } = useContext(ConnectionContext) || {
    isConnected: false,
    isLoading: false,
  };
  const { cursor, cursorClassName, showCursor } = useCursorAnimation({
    cursorStyle: "_",
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
      <h1 className="mb-8 text-5xl tracking-tight">Researching Dev...</h1>
      <h2 className="mb-8 text-xl text-gray-600">
        <span className="mx-2 inline-flex items-center">
          <span className="text-gray-600">Connection: </span>
          <div
            className={`mx-2 size-3 rounded-full ${isLoading ? "bg-amber-500" : isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
        </span>
        <span>{elapsedTime}s</span>
      </h2>
      <div className="mx-auto mb-8 max-w-3xl">
        <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
        <Card>
          <CardContent className="whitespace-pre-wrap py-4 text-left">
            {log}<span className={cursorClassName}>{showCursor ? cursor : ""}</span>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CompleteAgentResult({ 
  title, 
  report 
}: { 
  title: string; 
  report: string 
}) {
  return (
    <>
      <h1 className="mb-8 text-5xl tracking-tight">Research Complete</h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Here is what we know about your dev
      </h2>
      <div className="mx-auto mb-8 max-w-3xl">
        <h3 className="mb-4 text-2xl font-semibold">{title}</h3>
        <Card className="font-sans">
          <CardContent className="prose prose-sm max-w-none py-6 text-left dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {report}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
