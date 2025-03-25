import { useEffect, useRef, useState } from "react";

interface DevSearchInputProps {
  autoFocus?: boolean;
  onSubmit?: (value: string) => void;
}

export function DevSearchInput({
  autoFocus = false,
  onSubmit,
}: DevSearchInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(value);
    }
  };

  // For keyboard accessibility
  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <label
        id="github-input-label"
        htmlFor="github-input"
        className="mb-2 block text-left font-mono text-lg"
      >
        Enter GitHub username or URL of your dev:
      </label>

      <div
        ref={containerRef}
        role="textbox"
        aria-labelledby="github-input-label"
        tabIndex={0}
        className="relative h-12 rounded-md border border-primary bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => inputRef.current?.focus()}
        onKeyUp={handleKeyUp}
      >
        <div className="flex h-full items-center font-mono text-lg">
          <span>{value}</span>
          {/* Always show the blinking cursor when empty, or when focused */}
          {(value === '' || focused) && (
            <span className="blinking-cursor ml-0.5">_</span>
          )}
        </div>
        <input
          ref={inputRef}
          id="github-input"
          aria-label="GitHub username or URL input"
          type="text"
          className="absolute inset-0 size-full cursor-text opacity-0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoCapitalize="none"
        />
      </div>
    </>
  );
}
