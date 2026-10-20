import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { SelectContent, SelectTrigger } from "@/components/ui/select";

export type AppSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type AppSelectProps = {
  options: readonly AppSelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
  active?: boolean;
  triggerClassName?: string;
  triggerProps?: Omit<ComponentPropsWithoutRef<typeof SelectTrigger>, "children" | "className">;
  contentProps?: Pick<
    ComponentPropsWithoutRef<typeof SelectContent>,
    "align" | "alignItemWithTrigger"
  >;
  tooltip?: ReactNode;
};
