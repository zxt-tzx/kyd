import { type FieldApi } from "@tanstack/react-form";
import { AlertCircleIcon } from "lucide-react";

interface ValidationErrorsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: FieldApi<any, any, any, any, any>;
  error: string | null;
}

export function ValidationErrors({ field, error }: ValidationErrorsProps) {
  const validationError =
    field.state.meta.isTouched && field.state.meta.errors.length
      ? field.state.meta.errors
          .filter((err: unknown): err is string => typeof err === "string")
          .join(", ")
      : null;

  const errors = [validationError, error].filter(Boolean);
  const displayError = errors.length > 0 ? errors.join(", ") : null;

  return displayError ? (
    <div className="flex items-start gap-2 rounded-md bg-destructive/5 px-3 py-2 text-left text-sm text-destructive">
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <span className="font-medium">{displayError}</span>
    </div>
  ) : null;
}
