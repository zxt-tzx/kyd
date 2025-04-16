export function ResearchResultSkeleton() {
  return (
    <div className="relative flex w-full justify-center pt-28">
      <div className="w-full max-w-screen-md px-4 text-center">
        <h1 className="mb-8 font-mono text-5xl tracking-tight">Loading...</h1>
        <div className="mx-auto mb-8 max-w-md">
          {/* TODO: align with ResearchResult */}
          <div className="animate-pulse rounded-md bg-gray-200 p-4"></div>
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
