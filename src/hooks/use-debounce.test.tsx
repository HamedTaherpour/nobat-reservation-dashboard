import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebounce } from "./use-debounce";

describe("useDebounce", () => {
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately and updates after the delay", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    expect(result.current).toBe("initial");
    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("updated");
  });

  it("only applies the latest value after rapid changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 3 });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe(1);

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(3);
  });

  it("cleans up its pending timer on unmount", () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const { rerender, unmount } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: "initial" },
    });

    rerender({ value: "pending" });

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    clearTimeoutSpy.mockRestore();
  });
});
