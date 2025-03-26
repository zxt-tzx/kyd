import { z } from "zod";

export const repoUserInputSchema = z.object({
  owner: z
    .string()
    .min(1)
    .max(39)
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
      "Username must contain only alphanumeric characters or single hyphens, and cannot begin or end with a hyphen",
    )
    .transform((owner) => owner.toLowerCase()),
  repo: z
    .string()
    .min(1)
    .max(100)
    .regex(
      /^[a-zA-Z0-9._][a-zA-Z0-9._-]*$/,
      "Repository name cannot start with a dot/hyphen and can only contain letters, numbers, dots, hyphens, and underscores",
    )
    .refine(
      (name) => !name.endsWith(".git"),
      "Repository name cannot end with .git",
    )
    .transform((name) => name.toLowerCase()),
});

// Shared error message
export const INVALID_REPO_MESSAGE = "Please enter a valid GitHub repository";

// Utility function to extract owner and repo, with validation
export const validateAndExtractGithubOwnerAndRepo = (
  input: string,
  ctx?: z.RefinementCtx,
) => {
  // Normalize the input to handle both URL and owner/repo format
  const normalizedInput = input.includes("github.com")
    ? new URL(
        input.startsWith("http") ? input : `https://${input}`,
      ).pathname.slice(1)
    : input;
  // Split and filter out empty strings
  const parts = normalizedInput.split("/").filter(Boolean);
  // Validate we have exactly owner and repo
  if (parts.length !== 2) {
    if (ctx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: INVALID_REPO_MESSAGE,
      });
    }
    return null;
  }
  const [owner, repo] = parts;
  // Validate against schema
  const result = repoUserInputSchema.safeParse({ owner, repo });
  if (!result.success) {
    if (ctx) {
      result.error.errors.forEach((err) => ctx.addIssue(err));
    }
    return null;
  }

  return result.data;
};

const INVALID_USERNAME_MESSAGE = "Please enter a valid GitHub username";

// Schema for GitHub username validation
export const githubUsernameSchema = z
  .string()
  .min(1)
  .max(39)
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
    INVALID_USERNAME_MESSAGE,
  )
  .transform((username) => username.toLowerCase());

// Utility function to extract username, with validation
export function validateAndExtractGithubUsername(
  input: string,
  ctx?: z.RefinementCtx,
) {
  // Normalize the input to handle both URL and username format
  const normalizedInput = input.includes("github.com")
    ? new URL(
        input.startsWith("http") ? input : `https://${input}`,
      ).pathname.slice(1)
    : input;
  // Split and filter out empty strings
  const parts = normalizedInput.split("/").filter(Boolean);
  // Validate we have exactly username
  if (parts.length !== 1) {
    if (ctx) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: INVALID_USERNAME_MESSAGE,
      });
    }
    return null;
  }
  const [username] = parts;
  // Validate against schema
  const result = githubUsernameSchema.safeParse(username);
  if (!result.success) {
    if (ctx) {
      result.error.errors.forEach((err) => ctx.addIssue(err));
    }
    return null;
  }

  return result.data;
}

// Schema for submission (with transform)
export const githubUsernameSubmitSchema = z
  .object({
    input: z.string(),
  })
  .transform((data, ctx) => {
    const result = validateAndExtractGithubUsername(data.input, ctx);
    if (!result) return z.NEVER;
    return result;
  });
