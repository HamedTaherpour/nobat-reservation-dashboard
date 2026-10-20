"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AppTooltipProps } from "./app-tooltip.types";

export function AppTooltip(props: AppTooltipProps) {
  const { children, content } = props;

  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent role="tooltip">{content}</TooltipContent>
    </Tooltip>
  );
}
