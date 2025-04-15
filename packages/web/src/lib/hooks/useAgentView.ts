import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getResearchByNanoId } from "../api/research";
import { queryKeys } from "../queryClient";

export const useAgentViewQueryOptions = (nanoId: string) =>
  queryOptions({
    queryKey: queryKeys.research.agent(nanoId),
    queryFn: () => getResearchByNanoId(nanoId),
  });

export const useAgentView = (researchNanoId: string) => {
  return useSuspenseQuery(useAgentViewQueryOptions(researchNanoId));
};

export type AgentView = ReturnType<typeof useAgentView>["data"];
