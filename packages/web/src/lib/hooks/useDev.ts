import { useMutation } from "@tanstack/react-query";

// import { queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { researchDev } from "../api/dev";

export const useResearchDev = () => {
  // const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (username: string) => researchDev(username),
    onSuccess: ({ message, data: { username } }) => {
      toast({
        title: `Research on ${username} initiated`,
        description: message,
        duration: 10000,
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
