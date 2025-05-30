import { Link } from "@tanstack/react-router";
import { BeakerIcon, InfoIcon, UserSearchIcon } from "lucide-react";

import { DarkModeToggle } from "@/components/navbar/DarkModeToggle";

export function Navbar() {
  const standardLogo = (
    <div className="flex items-center gap-2">
      <UserSearchIcon className="size-6 text-primary" />
      <span className="text-primary">KYD</span>
    </div>
  );
  const lightModeLogo = (
    <h1 className="flex items-center text-2xl dark:hidden">{standardLogo}</h1>
  );
  const darkModeLogo = (
    <h1 className="hidden items-center text-2xl dark:flex">{standardLogo}</h1>
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
        <Link
          to="/about"
          className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
        >
          <InfoIcon className="size-4" />
          <span>About</span>
        </Link>
        <Link
          to="/test"
          className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
        >
          <BeakerIcon className="size-4" />
          <span>Test</span>
        </Link>
        <DarkModeToggle />
      </nav>
    </div>
  );
}
