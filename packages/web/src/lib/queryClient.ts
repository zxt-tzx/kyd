import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  session: ["session"] as const,
  query: {
    agent: (urlId: string) => ["query", urlId] as const,
  },
} as const;

export const queryClient = new QueryClient();
