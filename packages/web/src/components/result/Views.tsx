import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResearchResultView({
  isLoading,
  errorMessage,
  isConnected,
  agentStatus,
  component,
}: {
  isLoading: boolean;
  errorMessage: string | null;
  isConnected: boolean;
  agentStatus: string;
  component: React.ReactNode;
}) {
  // Prioritize error, then loading, then agent status/component
  if (errorMessage) {
    return <ErrorMessageView message={errorMessage} />;
  }
  if (isLoading) {
    return (
      <ResearchResultSkeleton isLoading={isLoading} isConnected={isConnected} />
    );
  }
  if (agentStatus === "inactive") {
    return <NotFoundView />;
  }
  // Otherwise, show the main component
  return component;
}

export function ResearchResultSkeleton({
  isLoading = true,
  isConnected = false,
}: {
  isLoading?: boolean;
  isConnected?: boolean;
}) {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-xl px-4 text-center">
        {/* Title Skeleton */}
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-12 w-72" />
        </div>

        {/* Status line and Stop button Skeleton */}
        <div className="mx-auto mb-8 max-w-3xl flex items-center justify-between">
          <div className="inline-flex items-center w-64">
            <Skeleton className="mr-2 h-5 w-28" />
            <div
              className={`mx-2 size-3 rounded-full ${
                isLoading
                  ? "bg-amber-500"
                  : isConnected
                    ? "bg-primary"
                    : "bg-destructive"
              }`}
            />
          </div>
          <div className="w-64 text-center">
            <Skeleton className="h-6 w-32 mx-auto" />
          </div>
          <div className="w-64 flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Research Steps Skeleton */}
        <div className="mx-auto mb-8 max-w-3xl">
          {/* Title Skeleton */}
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-8 w-full max-w-md" />
          </div>

          {/* Card with content skeleton */}
          <Card>
            <CardContent className="whitespace-pre-wrap py-4 text-left">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-2 h-6 w-2/3" />
              <Skeleton className="mb-2 h-6 w-5/6" />
              <Skeleton className="mb-2 h-6 w-1/2" />
              <Skeleton className="h-6 w-4/5" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function NotFoundView() {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-xl px-4 text-center">
        <h1 className="mb-8 text-5xl tracking-tight">
          Inactive Research Agent
        </h1>
        <h2 className="mb-8 text-xl text-muted-foreground">
          Please check your URL
        </h2>
        <Button asChild>
          <a href="/">Return Home</a>
        </Button>
      </div>
    </div>
  );
}

export function ErrorView({ error }: { error: unknown }) {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";

  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-md px-4 text-center">
        <h1 className="mb-8 text-5xl tracking-tight">Something Went Wrong</h1>
        <div className="mx-auto mb-8 max-w-md">
          <p className="mb-4 text-xl text-gray-600">
            We encountered an error while processing your request.
          </p>
          <div className="mb-8 rounded-md bg-red-50 p-4 text-left">
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorMessageView({ message }: { message: string | null }) {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-md px-4 text-center">
        <h1 className="mb-8 text-5xl tracking-tight">Connection Error</h1>
        <div className="mx-auto mb-8 max-w-md">
          <p className="mb-4 text-xl text-gray-600">
            We encountered an error connecting to the agent.
          </p>
          <div className="mb-8 rounded-md bg-red-50 p-4 text-left">
            <p className="text-red-700">{message ?? "Something went wrong"}</p>
          </div>
          <Button asChild>
            <a href="/">Return Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
