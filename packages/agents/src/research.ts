import type { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import type Exa from "exa-js";

export async function extractInfoFromWebsite({
  url,
  exa,
  model,
  instructions,
}: {
  url: string;
  exa: Exa;
  model: ReturnType<typeof openai>;
  instructions: {
    whatThisIs: string;
    whatToExtract: string;
  };
}) {
  const urlText = (await exa.getContents(url)).results
    .map((r) => r.text)
    .join("\n\n");
  await generateText({
    model,
    system: `You are a helpful assistant that is an expert at processing large amounts of textual information. You are given ${instructions.whatThisIs} and your job is to extract ${instructions.whatToExtract}`,
    messages: [
      {
        role: "user",
        content: `Please extract from the following text: "${urlText}"`,
      },
    ],
    temperature: 0.3,
  });
}
