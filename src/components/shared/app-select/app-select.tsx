"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppTooltip } from "@/components/shared/app-tooltip";
import { cn } from "cn";

import type { AppSelectProps } from "./app-select.types";

function AppSelect(props: AppSelectProps) {
  const {
    options,
    value,
    onValueChange,
    placeholder,
    icon,
    valueClassName,
    active,
    triggerClassName,
    triggerProps,
    contentProps,
    tooltip,
  } = props;
  const selectedOption = options.find((option) => option.value === value);

  const trigger = (
    <SelectTrigger
      {...triggerProps}
      className={cn(triggerClassName)}
      data-active={active || undefined}
    >
      {icon ? <span className="flex size-4 items-center justify-center">{icon}</span> : null}
      <SelectValue className={valueClassName} placeholder={placeholder}>
        {selectedOption?.label}
      </SelectValue>
    </SelectTrigger>
  );

  return (
    <Select value={value ?? ""} onValueChange={onValueChange}>
      {tooltip ? <AppTooltip content={tooltip}>{trigger}</AppTooltip> : trigger}
      <SelectContent {...contentProps}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export { AppSelect };
