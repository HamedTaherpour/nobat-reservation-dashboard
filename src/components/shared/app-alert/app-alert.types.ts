import type { AriaRole, ReactNode } from "react";

export type AppAlertVariant = "info" | "success" | "warning" | "error";

type AppAlertMessageContent =
  | {
      message: ReactNode;
      children?: never;
    }
  | {
      message?: never;
      children: ReactNode;
    };

export type AppAlertProps = AppAlertMessageContent & {
  variant?: AppAlertVariant;
  title?: ReactNode;
  className?: string;
  role?: AriaRole;
};
