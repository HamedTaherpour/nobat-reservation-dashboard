import React, { useId } from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

import type { AppEmptyProps } from "./app-empty.types";

function AppEmpty(props: AppEmptyProps) {
  const { title, description, icon, action, ...emptyProps } = props;

  const titleId = `app-empty-title-${useId().replaceAll(":", "")}`;

  return (
    <Empty aria-labelledby={titleId} {...emptyProps}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <h2 id={titleId} className="font-heading text-sm font-medium tracking-tight">
          {title}
        </h2>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}

export { AppEmpty };
