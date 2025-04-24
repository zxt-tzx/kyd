import type { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { parse } from "node-html-parser";

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
