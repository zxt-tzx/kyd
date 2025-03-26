import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { researchDev } from "../api/dev";

export const useResearchDev = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (username: string) => researchDev(username),
    onSuccess: ({ data: { username }, message }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.dev.research(username),
      });
      toast({
        title: "Research completed successfully",
        description: message,
      });
    },
    onError: (error) => {
      console.error("Failed to research dev:", error);
      toast({
        title: "Failed to research dev",
        variant: "destructive",
        description: error.message,
      });
    },
  });
};
