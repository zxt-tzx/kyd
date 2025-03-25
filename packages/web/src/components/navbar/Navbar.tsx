import { Link } from "@tanstack/react-router";
import { RadarIcon } from "lucide-react";

import { DarkModeToggle } from "@/components/navbar/DarkModeToggle";

export function Navbar() {
  const standardLogo = (
    <div className="flex items-center gap-2">
      <RadarIcon className="size-6 text-primary" />
      <span className="text-primary">Know Your Dev</span>
    </div>
  );
  const lightModeLogo = (
    <h1 className="flex items-center font-mono text-2xl dark:hidden">
      {standardLogo}
    </h1>
  );
  const darkModeLogo = (
    <h1 className="hidden items-center font-mono text-2xl dark:flex">
      {standardLogo}
    </h1>
  );
  return (
    <div className="flex h-16 w-full items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          {lightModeLogo}
          {darkModeLogo}
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        <DarkModeToggle />
      </nav>
    </div>
  );
}
