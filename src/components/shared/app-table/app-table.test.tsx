import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppTable, type AppTableColumn } from ".";

type Person = { id: string; name: string; visits: number };

const columns: AppTableColumn<Person>[] = [
  { id: "name", header: "نام", accessorKey: "name" },
  { id: "visits", header: "نوبت‌ها", accessorKey: "visits" },
];

const data: Person[] = [
  { id: "person-1", name: "آوا", visits: 3 },
  { id: "person-2", name: "سارا", visits: 1 },
];

describe("AppTable", () => {
  it("renders typed headers, cells, custom cells, and stable row identities", () => {
    render(
      <AppTable
        columns={[
          ...columns,
          {
            id: "custom",
            header: ({ id }) => `سفارشی ${id}`,
            cell: (person) => <strong>{person.name.toUpperCase()}</strong>,
          },
        ]}
        data={data}
        getRowId={(person) => person.id}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "نام" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "سفارشی custom" })).toBeInTheDocument();
    expect(screen.getAllByText("آوا")).toHaveLength(2);
    expect(screen.getByText("آوا", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /آوا/ })).toHaveAttribute("data-row-id", "person-1");
  });

  it("renders an accessible caption and caller-provided empty state", () => {
    render(
      <AppTable
        columns={columns}
        data={[]}
        getRowId={(person) => person.id}
        caption="فهرست مراجعه‌کنندگان"
        emptyState={<p>موردی پیدا نشد</p>}
      />,
    );

    expect(screen.getByRole("table", { name: "فهرست مراجعه‌کنندگان" })).toBeInTheDocument();
    expect(screen.getByText("فهرست مراجعه‌کنندگان")).toHaveClass("sr-only");
    expect(screen.getByText("موردی پیدا نشد")).toBeInTheDocument();
  });

  it("renders keyboard-accessible actions without making the row itself interactive", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    const { container } = render(
      <AppTable
        columns={[
          ...columns,
          {
            id: "actions",
            header: "عملیات",
            cell: () => <button onClick={onAction}>مشاهده</button>,
          },
        ]}
        data={data}
        getRowId={(person) => person.id}
      />,
    );

    const row = container.querySelector<HTMLElement>('tr[data-row-id="person-1"]');
    expect(row).toBeInTheDocument();
    if (!row) throw new Error("Expected the first data row to be rendered");
    expect(row).not.toHaveAttribute("role", "button");
    expect(row).not.toHaveAttribute("tabindex");
    expect(row).not.toHaveAttribute("onclick");

    const action = within(row).getByRole("button", { name: "مشاهده" });
    await user.tab();
    expect(action).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledOnce();

    await user.click(action);
    expect(onAction).toHaveBeenCalledTimes(2);
  });
});
