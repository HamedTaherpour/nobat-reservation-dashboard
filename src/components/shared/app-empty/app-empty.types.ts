import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { Empty } from "@/components/ui/empty";

export type AppEmptyProps = ComponentPropsWithoutRef<typeof Empty> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};
