import { initGraphQLTada } from "gql.tada";

import type { introspection } from "./schema.docs.graphql.d.ts";

export const graphql = initGraphQLTada<{
  introspection: introspection;
}>();

export type { FragmentOf, ResultOf, VariablesOf } from "gql.tada";
export { readFragment } from "gql.tada";
