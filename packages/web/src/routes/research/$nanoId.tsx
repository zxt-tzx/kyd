import { createFileRoute } from "@tanstack/react-router";

import { ApiError } from "@/lib/api/client";
import { ResearchResult } from "@/components/result/ResearchResult";
import {
  ErrorMessageView,
  ErrorView,
  NotFoundView,
  ResearchResultSkeleton,
} from "@/components/result/Views";

export const Route = createFileRoute("/research/$nanoId")({
  component: AgentView,
  pendingComponent: () => <ResearchResultSkeleton />,
  errorComponent: ({ error }: { error: unknown }) => {
    if (error instanceof ApiError && error.code === 404) {
      return <NotFoundView />;
    }
    return <ErrorView error={error} />;
  },
});

function AgentView() {
  const { nanoId } = Route.useParams();
  const { isLoading, isConnected, errorMessage, agentStatus, component } =
    ResearchResult({
      nanoId,
    });

  // Show loading screen while connecting to websocket
  if (isLoading) {
    return <ResearchResultSkeleton />;
  }
  if (isConnected && agentStatus === "loading") {
    return <ResearchResultSkeleton />;
  }

  // Show ErrorMessageView if there's an error message
  if (errorMessage !== null || !isConnected) {
    return <ErrorMessageView message={errorMessage} />;
  }

  // Show NotFoundView if connected but agent is inactive
  if (isConnected && agentStatus === "inactive") {
    return <NotFoundView />;
  }

  // Return the main component
  return component;
}
