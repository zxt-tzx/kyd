import { createFileRoute } from "@tanstack/react-router";

import { ApiError } from "@/lib/api/client";
import { ResearchResult } from "@/components/result/ResearchResult";
import {
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
  const result = ResearchResult({ nanoId });

  // Show loading screen while connecting to websocket
  if (result.isLoading) {
    return <ResearchResultSkeleton />;
  }

  // Show NotFoundView if connected but agent is inactive
  if (result.isConnected && result.agentState.status === "inactive") {
    return <NotFoundView />;
  }

  // Return the main component
  return result.component;
}
