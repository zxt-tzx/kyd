import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";

import { validateAndExtractGithubUsername } from "@/core/github/schema.validation";
import { fetchUser, IS_USER_MESSAGE, isUser } from "@/core/github/user";
import { useCursorAnimation } from "@/hooks/useCursorAnimation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPreview,
  UserPreviewSkeleton,
} from "@/components/users/UserPreview";
import { ValidationErrors } from "@/components/ValidationErrors";

const PROMPT_SUGGESTIONS = [
  "I am a founder hiring a full-stack dev",
  "I am a VC evaluating this technical founder",
  "I am an EM looking for a systems programmer",
];

export function DevSearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof fetchUser>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const { cursor, cursorClassName, showCursor } = useCursorAnimation({
    cursorStyle: "_",
  });

  const form = useForm({
    defaultValues: {
      githubInput: "",
      promptInput: "",
    },
    onSubmit: async ({ value }) => {
      // Validate GitHub username using the validation utility
      const username = validateAndExtractGithubUsername(value.githubInput);
      if (!username) {
        setError("Invalid GitHub username");
        setPreview(null);
        return;
      }

      try {
        setError(null);
        setIsLoadingPreview(true);
        const user = await fetchUser(username);
        if (!isUser(user)) {
          throw new Error(IS_USER_MESSAGE);
        }
        setPreview(user);
        // blur the input to dismiss the keyboard on mobile
        inputRef.current?.blur();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user");
        setPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    },
  });

  const handleCancel = () => {
    form.reset();
    setPreview(null);
    setSelectedPrompt("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handlePromptSelect = (prompt: string) => {
    // Update the input field directly through the form field
    form.setFieldValue("promptInput", prompt);
    setSelectedPrompt(prompt);
  };

  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <Label
          htmlFor="dev-github-user-input"
          className="block text-left text-lg"
        >
          Enter your dev&apos;s GitHub:
        </Label>

        <form.Field
          name="githubInput"
          children={(field) => (
            <div className="grid gap-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="dev-github-user-input"
                  type="text"
                  className="h-12 border border-primary text-lg text-transparent caret-transparent"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyUp={(e) => {
                    if (e.target instanceof HTMLInputElement) {
                      setCursorPosition(e.target.selectionStart ?? 0);
                    }
                  }}
                  onClick={(e) => {
                    if (e.target instanceof HTMLInputElement) {
                      setCursorPosition(e.target.selectionStart ?? 0);
                    }
                  }}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
                <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-lg">
                  <pre className="m-0 whitespace-pre p-0 text-[16px] text-foreground">
                    {form.state.values.githubInput.slice(0, cursorPosition)}
                    {isFocused ? (
                      <span className={cursorClassName}>
                        {showCursor
                          ? cursor
                          : (form.state.values.githubInput[cursorPosition] ??
                            "")}
                      </span>
                    ) : (
                      (form.state.values.githubInput[cursorPosition] ?? "")
                    )}
                    {form.state.values.githubInput.slice(cursorPosition + 1)}
                  </pre>
                </div>
              </div>
              <ValidationErrors field={field} error={error} />
            </div>
          )}
        />
      </form>

      {isLoadingPreview && <UserPreviewSkeleton />}

      {preview && !isLoadingPreview && (
        <>
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
            onCancel={handleCancel}
            prompt={form.state.values.promptInput}
          />

          <div className="mt-6">
            <Label htmlFor="prompt-input" className="block text-left text-lg">
              What are you looking for? (Optional)
            </Label>
            <form.Field
              name="promptInput"
              children={(field) => (
                <div className="grid gap-2">
                  <Textarea
                    ref={promptInputRef}
                    id="prompt-input"
                    className="min-h-[100px] border border-primary text-lg"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      setSelectedPrompt("");
                    }}
                    placeholder="Describe your research needs or select from suggestions below"
                  />
                </div>
              )}
            />

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {PROMPT_SUGGESTIONS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={`rounded-md px-3 py-1 text-sm ${selectedPrompt === prompt ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                  onClick={() => handlePromptSelect(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
