import {
  BuildingIcon,
  GlobeIcon,
  InfoIcon,
  Loader2Icon,
  LoaderIcon,
  MailIcon,
  MapPinIcon,
} from "lucide-react";

import { useNewResearch } from "@/lib/hooks/useAgentResearch";
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
  onCancel: () => void;
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
  onCancel,
  className,
}: UserPreviewProps) {
  const researchDevMutation = useNewResearch();
  const isLoading = researchDevMutation.isPending;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors hover:bg-accent/5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Is this your dev?</h2>
      </div>
      <div className="flex items-start gap-3">
        <img
          src={avatarUrl}
          alt={login}
          className="size-10 rounded-full ring-1 ring-border"
        />
        <div className="grid flex-1 gap-1.5 text-left">
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
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {bio && (
              <div className="flex items-start gap-2">
                <InfoIcon className="size-4" />
                {bio}
              </div>
            )}
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
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => researchDevMutation.mutate(login)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : null}
          YES
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={onCancel}
          disabled={isLoading}
        >
          NO
        </Button>
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
