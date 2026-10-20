import React, { useId, forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AppInputProps } from "./app-input.types";

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(function AppInput(props, ref) {
  const { id, label, description, error, required, ...inputProps } = props;

  const generatedId = useId();
  const inputId = id ?? `app-input-${generatedId.replaceAll(":", "")}`;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const describedBy = [
    inputProps["aria-describedby"],
    description ? descriptionId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <Label htmlFor={inputId}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </Label>
      ) : null}
      <Input
        {...inputProps}
        ref={ref}
        id={inputId}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : inputProps["aria-invalid"]}
        aria-required={required || inputProps["aria-required"]}
      />
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export { AppInput };
