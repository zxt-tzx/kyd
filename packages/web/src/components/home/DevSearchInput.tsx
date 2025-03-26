import { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCursorAnimation } from "../../hooks/useCursorAnimation";

export function DevSearchInput() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { cursor, cursorClassName } = useCursorAnimation({
    cursorStyle: "_",
  });

  return (
    <div className="space-y-2">
      <Label
        htmlFor="github-username-input"
        className="block text-left font-mono text-lg"
      >
        Enter your dev&apos;s GitHub username:
      </Label>

      <div className="relative">
        <Input
          ref={inputRef}
          id="github-username-input"
          type="text"
          className="h-12 border border-primary font-mono text-lg text-transparent caret-transparent"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        <div className="pointer-events-none absolute inset-0 flex items-center px-3 font-mono text-lg">
          {/* use pre instead of span to preserve whitespace */}
          <pre className="m-0 whitespace-pre p-0 text-[16px] text-foreground">
            {value}
          </pre>
          {/* Show the cursor at the end of the text */}
          {isFocused && <span className={cursorClassName}>{cursor}</span>}
        </div>
      </div>
    </div>
  );
}
