"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { AppDrawerProps } from "./app-drawer.types";

function AppDrawer(props: AppDrawerProps) {
  const { open, onOpenChange, title, description, children, footer } = props;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-h-dvh overflow-hidden sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
        {footer ? <SheetFooter>{footer}</SheetFooter> : null}
      </SheetContent>
    </Sheet>
  );
}

export { AppDrawer };
