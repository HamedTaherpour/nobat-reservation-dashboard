import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { AppAlertProps, AppAlertVariant } from "./app-alert.types";

const alertIcons: Record<AppAlertVariant, LucideIcon> = {
  info: InfoIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  error: OctagonXIcon,
};

const alertStyles: Record<AppAlertVariant, string> = {
  info: "bg-card text-card-foreground [&_svg]:text-primary",
  success: "bg-card text-card-foreground [&_svg]:text-foreground",
  warning: "bg-muted text-foreground [&_svg]:text-foreground",
  error: "bg-card text-destructive [&_svg]:text-destructive",
};

export function AppAlert(props: AppAlertProps) {
  const { variant = "info", title, message, children, className, role } = props;

  const Icon = alertIcons[variant];
  const content = message ?? children;

  return (
    <Alert
      variant={variant === "error" ? "destructive" : "default"}
      role={role ?? (variant === "error" ? "alert" : undefined)}
      className={cn(alertStyles[variant], className)}
    >
      <Icon aria-hidden="true" />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{content}</AlertDescription>
    </Alert>
  );
}
