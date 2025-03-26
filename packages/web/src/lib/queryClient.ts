import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  session: ["session"] as const,
  dev: {
    research: (username: string) => ["dev", username] as const,
  },
} as const;

export const queryClient = new QueryClient();
