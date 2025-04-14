import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useToast } from "@/hooks/use-toast";

import { researchDev } from "../api/dev";

export const useResearchDev = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (username: string) => researchDev(username),
    onSuccess: ({ message, data: { username, urlId } }) => {
      toast({
        title: `Research on ${username} initiated`,
        description: message,
      });
      navigate({ to: `/query/${urlId}` });
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
