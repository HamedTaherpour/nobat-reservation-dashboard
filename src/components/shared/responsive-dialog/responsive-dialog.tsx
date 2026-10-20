"use client";

import React from "react";
import { useSyncExternalStore } from "react";

import { AppDialog } from "../app-dialog";
import { AppDrawer } from "../app-drawer";

import type { ResponsiveDialogProps } from "./responsive-dialog.types";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeToDesktopQuery(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getDesktopSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches;
}

function useIsDesktop() {
  return useSyncExternalStore(subscribeToDesktopQuery, getDesktopSnapshot, () => false);
}

/**
 * Renders a Dialog below the md breakpoint and a right-side Sheet at or above it.
 * Switching between those primitive types remounts the children. Callers should
 * keep state that must survive a breakpoint change outside this subtree, such
 * as controlled form values or a parent-owned form controller.
 */
function ResponsiveDialog(props: ResponsiveDialogProps) {
  const isDesktop = useIsDesktop();
  const Content = isDesktop ? AppDrawer : AppDialog;

  return <Content {...props} />;
}

export { ResponsiveDialog };
