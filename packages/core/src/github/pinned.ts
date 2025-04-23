// taken inspiration from git@github.com:berrysauce/pinned.git
import { parse, type HTMLElement } from "node-html-parser";
import { z } from "zod";

export const pinnedRepoSchema = z.object({
  author: z.string(),
  name: z.string(),
  description: z.string(),
  language: z.string(),
  stars: z.number().optional(),
  forks: z.number().optional(),
  url: z.string().url(),
});

export type PinnedRepo = z.infer<typeof pinnedRepoSchema>;

/**
 * Fetches pinned repositories for a GitHub user
 * @param username - The GitHub username to fetch pinned repositories for
 * @returns Array of pinned repository data
 * @throws Error if the user is not found, rate limit is exceeded, or other fetch errors
 */
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
