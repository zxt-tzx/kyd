import { createFileRoute } from "@tanstack/react-router";

import { Homepage } from "@/components/home/Homepage";

export const Route = createFileRoute("/")({
  component: Homepage,
});
