import { z } from "zod";

/* NB there are significant differences between GraphQL and REST:
- unlike REST API, GraphQL API distinguishes between issues and pull requests
- `author` object is nullable in GraphQL, whereas user is non-nullable. this is potentially problematic as it would make normalisation difficult
- `state` is different, GraphQL uses `OPEN` and `CLOSED`, REST includes `deleted`
- state reasons are different, GraphQL includes duplicate
- `isDraft` is only in REST (probably because it's only relevant for pull requests)
- hooked up GitHub GraphQL schema for type inference
*/

export type Repo = z.infer<typeof repoSchema>;

// shapes from REST API
export const repoSchema = z
  .object({
    owner: z
      .object({
        login: z.string(),
        avatar_url: z.string().url(),
      })
      .strip(),
    name: z.string(),
    description: z.string().nullable(),
    node_id: z.string(),
    html_url: z.string().url(),
    private: z.boolean(),
    stargazers_count: z.number(),
    full_name: z.string().optional(),
    language: z.string().nullable().optional(),
    forks_count: z.number().optional(),
    forks: z.number().optional(),
  })
  .strip();

export const authenticatedUserEmailsSchema = z.array(
  z.object({
    email: z.string(),
    primary: z.boolean(),
    verified: z.boolean(),
  }),
);

export type GitHubUser = z.infer<typeof githubUserSchema>;

export const githubUserSchema = z
  .object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    email: z.string().nullable(),
    avatar_url: z.string().url(),
    html_url: z.string().url(),
    // followers_url: z.string().url(),
    // following_url: z.string().url(),
    gists_url: z.string().url(), // useful
    starred_url: z.string().url(), // if you omit {/owner}{/repo} then this gives ALL starred repos of that user
    subscriptions_url: z.string().url(), // all PUBLIC repos that the user is watching
    organizations_url: z.string().url(), // all PUBLIC orgs that the user is a member of
    name: z.string().nullable(),
    company: z.string().nullable(),
    blog: z.string().nullable(), // could be useful to visit and get some info
    hireable: z.boolean().nullable(), // only acceptable values seems to be true or null
    location: z.string().nullable(),
    bio: z.string().nullable(),
    twitter_username: z.string().nullable(), // could be useful to visit and get some info
    public_repos: z.number(),
    public_gists: z.number(),
    followers: z.number(),
    following: z.number(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    type: z.enum(["User", "Organization"]),
    language: z.string().nullable().optional(),
    stargazers_count: z.number().optional(),
    forks: z.number().optional(),
    forks_count: z.number().optional(),
    full_name: z.string().optional(),
    files: z.record(z.unknown()).optional(),
    description: z.string().nullable().optional(),
  })
  .strip();
