import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";

import { githubUserSchema, type GitHubUser } from "@/core/github/schema.rest";
import { githubUsernameSubmitSchema } from "@/core/github/schema.validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPreview,
  UserPreviewSkeleton,
} from "@/components/users/UserPreview";
import { ValidationErrors } from "@/components/ValidationErrors";

import { useCursorAnimation } from "../../hooks/useCursorAnimation";

export function DevSearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof fetchUser>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { cursor, cursorClassName } = useCursorAnimation({
    cursorStyle: "_",
  });

  const form = useForm({
    defaultValues: {
      input: "",
    },
    onSubmit: async ({ value }) => {
      const result = githubUsernameSubmitSchema.safeParse(value);
      if (!result.success) {
        setError(result.error.errors[0]?.message ?? "Invalid GitHub username");
        setPreview(null);
        return;
      }
      try {
        setError(null);
        setIsLoadingPreview(true);
        const user = await fetchUser(result.data);
        setPreview(user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
      } finally {
        setIsLoadingPreview(false);
      }
    },
  });

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Label
        htmlFor="github-username-input"
        className="block text-left font-mono text-lg"
      >
        Enter your dev&apos;s GitHub username:
      </Label>

      <form.Field
        name="input"
        children={(field) => (
          <div className="grid gap-2">
            <div className="relative">
              <Input
                ref={inputRef}
                id="github-username-input"
                type="text"
                className="h-12 border border-primary font-mono text-lg text-transparent caret-transparent"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <div className="pointer-events-none absolute inset-0 flex items-center px-3 font-mono text-lg">
                {/* use pre instead of span to preserve whitespace */}
                <pre className="m-0 whitespace-pre p-0 text-[16px] text-foreground">
                  {form.state.values.input}
                </pre>
                {/* Show the cursor at the end of the text */}
                {isFocused && <span className={cursorClassName}>{cursor}</span>}
              </div>
            </div>
            <ValidationErrors field={field} error={error} />
          </div>
        )}
      />

      {isLoadingPreview && <UserPreviewSkeleton />}

      {preview && !isLoadingPreview && (
        <UserPreview
          login={preview.login}
          name={preview.name}
          email={preview.email}
          avatarUrl={preview.avatar_url}
          bio={preview.bio}
          company={preview.company}
          location={preview.location}
          twitterUsername={preview.twitter_username}
          blog={preview.blog}
        />
      )}
    </form>
  );
}

async function fetchUser(username: string): Promise<GitHubUser> {
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
  return githubUserSchema.parse(data);
}
