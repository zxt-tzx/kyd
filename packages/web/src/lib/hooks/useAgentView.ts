import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { queryKeys } from "../queryClient";

export const getRepoStatusQueryOptions = (urlId: string) =>
  queryOptions({
    queryKey: queryKeys.query.agent(urlId),
    // queryFn: () => getRepoStatus(owner, repo),
    // refetchIntervalInBackground: true,
    // refetchInterval: (query) => {
    //   const initStatus = query.state.data?.initStatus;
    //   if (initStatus === "in_progress" || initStatus === "ready") {
    //     return GET_REPO_STATUS_QUERY_REFETCH_INTERVAL;
    //   }
    //   return false;
    // },
    // retry: (failureCount, error) => {
    //   if (error instanceof ApiError && error.code === 404) {
    //     return false;
    //   }
    //   return failureCount < 3;
    // },
  });

export const useAgentView = (queryUrlId: string) => {};
