import type React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Loading Research
        </h1>
        <h2 className="mb-8 text-xl text-gray-600">
          <Skeleton className="mx-auto h-6 w-64" />
        </h2>

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

        {/* Research Steps Skeleton */}
        <div className="mx-auto mb-8 max-w-3xl">
          <h3 className="mb-4 text-2xl font-semibold">Research Steps</h3>
          <Card className="mb-2 w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card className="mb-2 w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
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
      <div className="w-full max-w-screen-md px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Research Not Found
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          The research you&apos;re looking for doesn&apos;t exist. Please check
          your URL.
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

export function ErrorView({ error }: { error: unknown }) {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";

  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-md px-4 text-center">
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

export function ErrorMessageView({ message }: { message: string | null }) {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-md px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">
          Connection Error
        </h1>
        <div className="mx-auto mb-8 max-w-md">
          <p className="mb-4 text-xl text-gray-600">
            We encountered an error connecting to the agent.
          </p>
          <div className="mb-8 rounded-md bg-red-50 p-4 text-left">
            <p className="font-mono text-red-700">
              {message ?? "Something went wrong"}
            </p>
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
