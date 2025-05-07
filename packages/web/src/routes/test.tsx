import { createFileRoute } from "@tanstack/react-router";

import { TestPage } from "@/components/test/TestPage";

export const Route = createFileRoute("/test")({ 
  component: TestPage,
});