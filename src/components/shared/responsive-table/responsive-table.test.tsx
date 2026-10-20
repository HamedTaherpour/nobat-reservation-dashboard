import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ResponsiveTable } from "./responsive-table";

type Person = { id: string; name: string };

const columns = [{ id: "name", header: "نام", accessorKey: "name" as const }];
const data: Person[] = [{ id: "person-1", name: "آوا" }];

describe("ResponsiveTable", () => {
  it("uses the same records for desktop and mobile and gives mobile stable keys", () => {
    const renderMobileRow = vi.fn((person: Person) => <span>کارت {person.name}</span>);
    const { container } = render(
      <ResponsiveTable<Person>
        columns={columns}
        data={data}
        getRowId={(person) => person.id}
        renderMobileRow={renderMobileRow}
      />,
    );

    expect(screen.getByText("کارت آوا")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "آوا" })).toBeInTheDocument();
    expect(renderMobileRow).toHaveBeenCalledWith(data[0], 0);

    const mobileItem = container.querySelector(".md\\:hidden li");
    expect(mobileItem).toBeInTheDocument();
    expect(mobileItem).toHaveTextContent("کارت آوا");
  });

  it("keeps the caller-provided empty state consistent in both views", () => {
    render(
      <ResponsiveTable<Person>
        columns={columns}
        data={[]}
        getRowId={(person) => person.id}
        renderMobileRow={(person) => <span>{person.name}</span>}
        emptyState={<p>داده‌ای موجود نیست</p>}
      />,
    );

    expect(screen.getAllByText("داده‌ای موجود نیست")).toHaveLength(2);
  });

  it("renders an accessible loading state with skeletons and responsive visibility classes", () => {
    const { container } = render(
      <ResponsiveTable<Person>
        columns={columns}
        data={data}
        getRowId={(person) => person.id}
        renderMobileRow={(person) => <button>ویرایش {person.name}</button>}
        loading
        loadingRowCount={2}
      />,
    );

    expect(screen.getAllByRole("status", { name: "در حال بارگذاری" })).toHaveLength(2);
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(4);
    expect(container.querySelector(".hidden.md\\:block")).toBeInTheDocument();
    expect(container.querySelector(".md\\:hidden")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ویرایش/ })).not.toBeInTheDocument();
  });

  it("preserves accessible mobile actions", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ResponsiveTable<Person>
        columns={columns}
        data={data}
        getRowId={(person) => person.id}
        renderMobileRow={(person) => <button onClick={onClick}>ویرایش {person.name}</button>}
      />,
    );

    await user.click(screen.getByRole("button", { name: "ویرایش آوا" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
