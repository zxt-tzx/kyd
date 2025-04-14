import { useThemeToggle } from "@/hooks/useThemeToggle";
import { Button } from "@/components/ui/button";

export function DarkModeToggle() {
  const { ThemeIcon, handleThemeChange } = useThemeToggle();

  const handleClick = () => {
    handleThemeChange();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <ThemeIcon className="size-[1.2rem] animate-in fade-in" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
