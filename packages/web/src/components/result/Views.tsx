export function ResearchResultSkeleton() {
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

export function NotFoundView() {
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

export function ErrorView({ error }: { error: unknown }) {
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
