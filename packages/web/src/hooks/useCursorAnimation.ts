import { useEffect, useState } from "react";

type CursorStyle = "_" | "|" | "▋";

interface UseCursorAnimationOptions {
  cursorStyle?: CursorStyle;
  blinkInterval?: number;
}

export function useCursorAnimation({
  cursorStyle = "_",
  blinkInterval = 500,
}: UseCursorAnimationOptions) {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, blinkInterval);

    return () => clearInterval(interval);
  }, [blinkInterval]);

  return {
    cursor: cursorStyle,
    cursorClassName: "text-primary",
    showCursor,
  };
}
