import "./globals.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";

import { queryClient } from "@/lib/queryClient";
import { Spinner } from "@/components/ui/spinner";

import { Error } from "./components/Error";
import { NotFound } from "./components/NotFound";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0, // use react query to manage stale time instead of router
  context: { queryClient },
  defaultPendingComponent: () => (
    <div className="mx-auto mt-8 flex flex-col items-center justify-center">
      <Spinner size="md" />
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  ),
  defaultNotFoundComponent: () => <NotFound />,
  defaultErrorComponent: ({ error }) => <Error error={error} />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
