import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type AppInputProps = ComponentPropsWithoutRef<"input"> & {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
};
