import { GithubUserSchema, type GitHubUser } from "./schema.rest";

/**
 * Fetches a GitHub user by username and validates the response
 * @param username - The GitHub username to fetch
 * @returns The validated GitHub user data
 * @throws Error if the user is not found, rate limit is exceeded, or other fetch errors
 */
export async function fetchUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`);
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "User not found"
        : response.status === 403
          ? "Rate limit exceeded. Please try again later."
          : "Failed to fetch user",
    );
  }
  const data = await response.json();
  return GithubUserSchema.parse(data);
}

export function isUser(user: GitHubUser) {
  return user.type === "User";
}

export const IS_USER_MESSAGE =
  "Please ensure this is a valid GitHub user account.";
