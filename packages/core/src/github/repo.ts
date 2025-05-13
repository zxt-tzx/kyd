import type { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { parse, type HTMLElement } from "node-html-parser";
import { z } from "zod";

export const PinnedRepoSchema = z.object({
  author: z.string(),
  name: z.string(),
  description: z.string(),
  language: z.string(),
  stars: z.number().optional(),
  forks: z.number().optional(),
  url: z.string().url(),
});

export type PinnedRepo = z.infer<typeof PinnedRepoSchema>;

/**
 * Fetches pinned repositories for a GitHub user
 * @param username - The GitHub username to fetch pinned repositories for
 * @returns Array of pinned repository data
 * @throws Error if the user is not found, rate limit is exceeded, or other fetch errors
 */
// inspired by https://github.com/berrysauce/pinned
export async function fetchPinnedRepos(
  username: string,
): Promise<PinnedRepo[]> {
  const response = await fetch(`https://github.com/${username}`);

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "User not found"
        : response.status === 429
          ? "Rate limit exceeded. Please try again later."
          : "Failed to fetch user",
    );
  }

  const html = await response.text();
  const root = parse(html);

  try {
    const pinnedRepos = root
      .querySelectorAll(".js-pinned-item-list-item")
      .map((el) => parseRepository(root, el));

    return pinnedRepos;
  } catch (_error) {
    throw new Error("Error parsing user's pinned repositories");
  }
}

/**
 * Helper function to parse repository HTML elements into structured data
 * @private
 */
function parseRepository(_root: HTMLElement, el: HTMLElement): PinnedRepo {
  const repoPath =
    el.querySelector("a")?.getAttribute("href")?.split("/") || [];
  const [, author = "", name = ""] = repoPath;

  const parseMetric = (index: number): number => {
    try {
      return (
        Number(
          el
            .querySelectorAll("a.pinned-item-meta")
            [index]?.text?.replace(/\n/g, "")
            .trim(),
        ) || 0
      );
    } catch {
      return 0;
    }
  };

  return {
    author,
    name,
    description:
      el.querySelector("p.pinned-item-desc")?.text?.replace(/\n/g, "").trim() ||
      "",
    language:
      el.querySelector("span[itemprop='programmingLanguage']")?.text || "",
    stars: parseMetric(0),
    forks: parseMetric(1),
    url: `https://github.com/${author}/${name}`,
  };
}

export async function extractFromGithubRepo({
  url,
  model,
  instructions,
}: {
  url: string;
  model: ReturnType<typeof openai>;
  instructions: {
    whatThisIs: string;
    whatToExtract: string;
  };
}) {
  // Fetch website content
  const response = await fetch(url);
  const html = await response.text();

  // Parse HTML into a DOM structure
  const root = parse(html);

  // Extract textual content from the HTML
  // Remove excess whitespace, focus on meaningful content
  const pageTitle = root.querySelector("title")?.text || "";
  const headings = root
    .querySelectorAll("h1, h2, h3, h4, h5, h6")
    .map((el) => el.text.trim())
    .filter((text) => text.length > 0)
    .join("\n");

  // Get README content if it exists (common in GitHub repos)
  const readmeContent = root.querySelector("#readme")?.text.trim() || "";

  // Get description and other meta data
  const description =
    root.querySelector('meta[name="description"]')?.getAttribute("content") ||
    root.querySelector(".repo-description")?.text.trim() ||
    "";

  // Combine the extracted content
  const extractedText = [
    `Title: ${pageTitle}`,
    `Description: ${description}`,
    headings ? `Headings: ${headings}` : "",
    readmeContent ? `README: ${readmeContent}` : "",
  ]
    .filter((text) => text.length > 0)
    .join("\n\n");

  // Use the AI model to summarize the extracted content
  const { text } = await generateText({
    model,
    system: `You are a helpful assistant that is an expert at processing large amounts of textual information. You are given ${instructions.whatThisIs} and your job is to extract ${instructions.whatToExtract}`,
    messages: [
      {
        role: "user",
        content: `Please extract from the following text: "${extractedText}"`,
      },
    ],
    temperature: 0.3,
  });

  return text;
}
