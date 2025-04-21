import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";

import { githubUsernameSubmitSchema } from "@/core/github/schema.validation";
import { fetchUser, IS_USER_MESSAGE, isUser } from "@/core/github/user";
import { useCursorAnimation } from "@/hooks/useCursorAnimation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPreview,
  UserPreviewSkeleton,
} from "@/components/users/UserPreview";
import { ValidationErrors } from "@/components/ValidationErrors";

export function DevSearchInput() {
  const [isFocused, setIsFocused] = useState(false);
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof fetchUser>
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { cursor, cursorClassName, showCursor } = useCursorAnimation({
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
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
          name="input"
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
                    {form.state.values.input.slice(0, cursorPosition)}
                    {isFocused ? (
                      <span className={cursorClassName}>
                        {showCursor
                          ? cursor
                          : (form.state.values.input[cursorPosition] ?? "")}
                      </span>
                    ) : (
                      (form.state.values.input[cursorPosition] ?? "")
                    )}
                    {form.state.values.input.slice(cursorPosition + 1)}
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
        />
      )}
    </div>
  );
}
