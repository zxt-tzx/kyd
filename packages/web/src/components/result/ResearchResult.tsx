import { useAgent } from "agents/react";
import DOMPurify from "dompurify";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  AgentStateSchema,
  getAgentClientFetchOpts,
  type AgentState,
} from "@/core/agent/shared";
import { useCursorAnimation } from "@/hooks/useCursorAnimation";
import { Card, CardContent } from "@/components/ui/card";

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
            {log}
            <span className={cursorClassName}>{showCursor ? cursor : ""}</span>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CompleteAgentResult({
  title,
  report,
}: {
  title: string;
  report: string;
}) {
  // Remove any triple backticks markdown fences at the beginning and end of the report
  const cleanReport = report
    .replace(/^```markdown\s*\n/m, "") // Remove starting ```markdown
    .replace(/^```\s*\n/m, "") // Remove starting ```
    .replace(/\n```\s*$/m, ""); // Remove ending ```

  return (
    <>
      <h1 className="mb-8 text-5xl tracking-tight text-green-500">
        Research Complete
      </h1>
      <h2 className="mb-8 text-xl text-gray-600">
        Here is what we know about your dev
      </h2>
      <div className="mx-auto mb-8 max-w-3xl">
        <h3 className="mb-4 text-2xl font-semibold text-green-500">{title}</h3>
        <Card className="border border-green-500/20 bg-gray-950 font-sans">
          <CardContent className="py-6 text-left">
            {/* Terminal-style HTML markdown rendering with custom styling */}
            <div className="terminal-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings with terminal-style formatting
                  h1: ({ children, ...props }) => (
                    <h1
                      className="my-4 font-mono text-xl font-bold text-green-500"
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      className="my-3 font-mono text-lg font-bold text-green-500"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      className="my-2 font-mono font-bold text-green-500"
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4
                      className="font-mono font-bold text-green-500"
                      {...props}
                    >
                      {children}
                    </h4>
                  ),

                  // Regular text elements
                  p: ({ children, ...props }) => (
                    <p className="my-2 font-mono text-green-500" {...props}>
                      {children}
                    </p>
                  ),

                  // Lists
                  ul: ({ children, ...props }) => (
                    <ul
                      className="ml-5 list-disc font-mono text-green-500"
                      {...props}
                    >
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol
                      className="ml-5 list-decimal font-mono text-green-500"
                      {...props}
                    >
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="my-1 font-mono text-green-500" {...props}>
                      {children}
                    </li>
                  ),

                  // Special elements
                  a: ({ children, ...props }) => (
                    <a
                      className="font-mono text-green-300 underline"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="my-2 border-l-4 border-green-700 pl-4 font-mono italic text-green-400"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),

                  // Code formatting
                  code: ({ children, ...props }) => (
                    <code
                      className="rounded bg-gray-800 px-1 font-mono text-green-300"
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre
                      className="my-3 overflow-auto rounded bg-gray-900 p-3 font-mono text-green-300"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),

                  // Text formatting
                  strong: ({ children, ...props }) => (
                    <strong
                      className="font-mono font-bold text-green-300"
                      {...props}
                    >
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em className="font-mono italic text-green-300" {...props}>
                      {children}
                    </em>
                  ),

                  // Other elements
                  hr: () => <hr className="my-4 border-green-700" />,

                  // Tables
                  table: ({ children, ...props }) => (
                    <table
                      className="my-3 border-collapse font-mono text-green-500"
                      {...props}
                    >
                      {children}
                    </table>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="font-mono text-green-300" {...props}>
                      {children}
                    </thead>
                  ),
                  tbody: ({ children, ...props }) => (
                    <tbody className="font-mono text-green-500" {...props}>
                      {children}
                    </tbody>
                  ),
                  tr: ({ children, ...props }) => (
                    <tr
                      className="border-b border-green-900 font-mono"
                      {...props}
                    >
                      {children}
                    </tr>
                  ),
                  td: ({ children, ...props }) => (
                    <td
                      className="border-r border-green-900 p-2 font-mono"
                      {...props}
                    >
                      {children}
                    </td>
                  ),
                  th: ({ children, ...props }) => (
                    <th
                      className="border-r border-green-900 p-2 font-mono font-bold"
                      {...props}
                    >
                      {children}
                    </th>
                  ),
                }}
              >
                {cleanReport}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
