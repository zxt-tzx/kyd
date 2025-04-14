import {
  queryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { getQueryByUrlId } from "../api/query";
import { queryKeys } from "../queryClient";

export const useAgentViewQueryOptions = (urlId: string) =>
  queryOptions({
    queryKey: queryKeys.query.agent(urlId),
    queryFn: () => getQueryByUrlId(urlId),
  });

export const useAgentView = (queryUrlId: string) => {
  return useSuspenseQuery(useAgentViewQueryOptions(queryUrlId));
};

export type AgentView = ReturnType<typeof useAgentView>["data"];
