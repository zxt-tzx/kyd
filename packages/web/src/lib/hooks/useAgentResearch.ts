import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useToast } from "@/hooks/use-toast";

import { newDevResearch } from "../api/research";

export const useNewResearch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (username: string) => newDevResearch(username),
    onSuccess: ({ message, data: { username, nanoId } }) => {
      toast({
        title: `Research on ${username} initiated`,
        description: message,
      });
      navigate({ to: `/research/${nanoId}` });
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
