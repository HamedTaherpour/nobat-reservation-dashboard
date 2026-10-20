"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { AppDialogProps } from "./app-dialog.types";

function AppDialog(props: AppDialogProps) {
  const { open, onOpenChange, title, description, children, footer } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-rows-[auto_minmax(0,1fr)_auto] max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto">{children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export { AppDialog };
