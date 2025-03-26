import {
  BuildingIcon,
  GlobeIcon,
  LoaderIcon,
  MailIcon,
  MapPinIcon,
} from "lucide-react";

import { useResearchDev } from "@/lib/hooks/useDev";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XTwitterIcon } from "@/components/icons/XTwitterIcon";

export type UserPreviewProps = {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  blog: string | null;
  email: string | null;
  location: string | null;
  twitterUsername: string | null;
} & {
  className?: string;
};

export function UserPreview({
  login,
  name,
  avatarUrl,
  bio,
  company,
  blog,
  email,
  location,
  twitterUsername,
  className,
}: UserPreviewProps) {
  const researchDevMutation = useResearchDev();
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors hover:bg-accent/5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Is this your dev?</h2>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => researchDevMutation.mutate(login)}
        >
          Start research
        </Button>
      </div>
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={login}
          className="size-10 rounded-full ring-1 ring-border"
        />
        <div className="grid flex-1 gap-1.5">
          <div className="flex items-center gap-1">
            <a
              href={`https://github.com/${login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold"
            >
              {login}
            </a>
            {name && (
              <span className="text-muted-foreground">&nbsp;{name}</span>
            )}
          </div>
          {bio && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{bio}</p>
          )}
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {email && (
              <span className="flex items-center gap-2">
                <MailIcon className="size-4" />
                {email}
              </span>
            )}
            {twitterUsername && (
              <span className="flex items-center gap-2">
                <XTwitterIcon className="size-4" />@{twitterUsername}
              </span>
            )}
            {blog && (
              <span className="flex items-center gap-2">
                <GlobeIcon className="size-4" />
                {blog}
              </span>
            )}
            {company && (
              <span className="flex items-center gap-2">
                <BuildingIcon className="size-4" />
                {company}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-2">
                <MapPinIcon className="size-4" />
                {location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserPreviewSkeleton() {
  return (
    <div className="flex items-center justify-center py-4">
      <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
