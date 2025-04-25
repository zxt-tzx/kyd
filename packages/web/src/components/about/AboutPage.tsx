import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function AboutPage() {
  const [demoContent, setDemoContent] = useState("");

  // Fetch the markdown file from the public directory
  useEffect(() => {
    fetch("/demo.md")
      .then((response) => response.text())
      .then((text) => setDemoContent(text))
      .catch((error) => console.error("Error loading markdown:", error));
  }, []);

  return (
    <div className="relative flex w-full justify-center pt-16">
      <div className="w-full max-w-4xl px-4">
        <div className="mx-auto mb-8">
          <div className="card border border-primary/20 bg-card p-6">
            <div className="terminal-markdown">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Headings with styling
                  h1: ({ children, ...props }) => (
                    <h1
                      className="my-4 text-3xl font-bold text-primary"
                      {...props}
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      className="my-3 text-2xl font-bold text-primary"
                      {...props}
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      className="my-2 text-xl font-bold text-primary"
                      {...props}
                    >
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 className="text-lg font-bold text-primary" {...props}>
                      {children}
                    </h4>
                  ),

                  // Regular text elements
                  p: ({ children, ...props }) => (
                    <p className="my-2 text-foreground" {...props}>
                      {children}
                    </p>
                  ),

                  // Lists
                  ul: ({ children, ...props }) => (
                    <ul className="ml-5 list-disc text-foreground" {...props}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol
                      className="ml-5 list-decimal text-foreground"
                      {...props}
                    >
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li className="my-1 text-foreground" {...props}>
                      {children}
                    </li>
                  ),

                  // Special elements
                  a: ({ children, ...props }) => (
                    <a className="text-accent-foreground underline" {...props}>
                      {children}
                    </a>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      className="my-2 border-l-4 border-primary/40 pl-4 italic text-muted-foreground"
                      {...props}
                    >
                      {children}
                    </blockquote>
                  ),

                  // Code formatting
                  code: ({ children, ...props }) => (
                    <code
                      className="rounded bg-muted px-1 text-accent-foreground"
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre
                      className="my-3 overflow-auto rounded bg-muted p-3 text-accent-foreground"
                      {...props}
                    >
                      {children}
                    </pre>
                  ),

                  // Other elements
                  hr: () => <hr className="my-4 border-primary/40" />,
                }}
              >
                {demoContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
