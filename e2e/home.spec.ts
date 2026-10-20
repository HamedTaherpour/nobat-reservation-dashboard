import { expect, test } from "@playwright/test";

test("homepage exposes the Persian RTL reservation dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/نوبت/);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "داشبورد نوبت" })).toBeVisible();
  await expect(page.getByRole("button", { name: "رزرو جدید" })).toBeVisible();
  await expect(
    page.getByTestId("reservation-statistics-desktop-grid").getByText("کل رزروها"),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.locator("#upcoming-reservations-title")).toBeVisible();

  const searchInput = page.getByLabel("جستجوی رزروها");
  const searchIcon = page.locator("svg.lucide-search[aria-hidden='true']").first();
  await expect(searchIcon).toBeVisible();
  const [inputBox, iconBox] = await Promise.all([
    searchInput.boundingBox(),
    searchIcon.boundingBox(),
  ]);
  expect(inputBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(
    Math.abs(inputBox!.y + inputBox!.height / 2 - (iconBox!.y + iconBox!.height / 2)),
  ).toBeLessThan(2);

  await page.getByRole("button", { name: "صفحه بعد" }).click();
  await expect(page.getByText("سارا محمدی").first()).toBeVisible();
  await expect(page.getByText("صفحه 2 از 2")).toBeVisible();

  const defaultFilter = page.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
  const defaultSort = page.getByRole("combobox", { name: /مرتب‌سازی رزروها/ });
  const [defaultFilterAppearance, defaultSortAppearance] = await Promise.all([
    defaultFilter.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return { backgroundColor: styles.backgroundColor, borderColor: styles.borderTopColor };
    }),
    defaultSort.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return { backgroundColor: styles.backgroundColor, borderColor: styles.borderTopColor };
    }),
  ]);

  await defaultFilter.click();
  await expect(page.getByRole("option", { name: "همه رزروها", selected: true })).toBeVisible();
  await page.getByRole("option", { name: "لغوشده" }).click();
  const activeFilter = page.getByRole("combobox", { name: "فیلتر وضعیت رزروها: لغوشده" });
  await expect(activeFilter).toBeVisible();
  await expect(activeFilter.locator("svg.lucide-funnel")).toBeVisible();
  await expect(activeFilter).toContainText("لغوشده");
  await expect(activeFilter).toHaveAttribute("data-active", "true");
  await expect(activeFilter.locator("svg.lucide-check")).toHaveCount(0);
  const activeFilterAppearance = await activeFilter.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return { backgroundColor: styles.backgroundColor, borderColor: styles.borderTopColor };
  });
  expect(activeFilterAppearance.backgroundColor).toBe(defaultFilterAppearance.backgroundColor);
  expect(activeFilterAppearance.borderColor).not.toBe(defaultFilterAppearance.borderColor);

  await defaultSort.click();
  await page.getByRole("option", { name: "قدیمی‌ترین ابتدا" }).click();
  const activeSort = page.getByRole("combobox", { name: /مرتب‌سازی رزروها/ });
  await expect(activeSort).toHaveAttribute("data-active", "true");
  await activeSort.blur();
  const activeSortAppearance = await activeSort.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    return { backgroundColor: styles.backgroundColor, borderColor: styles.borderTopColor };
  });
  expect(activeSortAppearance.backgroundColor).toBe(defaultSortAppearance.backgroundColor);
  expect(activeSortAppearance.borderColor).not.toBe(defaultSortAppearance.borderColor);

  await page.setViewportSize({ width: 375, height: 720 });
  await expect(activeFilter).toBeVisible();
  await expect(page.getByRole("combobox", { name: /مرتب‌سازی رزروها/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("creates and persists a reservation from the responsive form", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "رزرو جدید" }).click();
  await expect(page.getByRole("dialog", { name: "ثبت رزرو جدید" })).toBeVisible();
  await page.locator("#reservation-customer-name").fill("کاربر آزمون رزرو");
  await page.locator("#reservation-customer-phone").fill("۰۹۱۲۱۲۳۴۵۶۷");
  await page.getByRole("combobox", { name: "خدمت" }).click();
  await page.getByRole("option", { name: "کوتاهی و اصلاح مو" }).click();
  await page.getByRole("button", { name: /^تاریخ رزرو/ }).click();
  await page.locator(".rmdp-day:not(.rmdp-disabled)").first().click();
  await page.locator("#reservation-time").fill("۰۹:۳۰");
  await page.getByRole("button", { name: "ثبت رزرو" }).click();

  await expect(page.getByText("رزرو جدید با موفقیت ثبت شد.")).toBeVisible();
  await expect(page.getByText("صفحه 1 از 2")).toBeVisible();
  await expect(page.getByText("کاربر آزمون رزرو").first()).toBeVisible();
  await expect(
    page
      .getByTestId("reservation-statistics-desktop-grid")
      .getByText("کل رزروها")
      .locator("..")
      .locator(".."),
  ).toContainText("13");

  await page.reload();
  await page.getByLabel("جستجوی رزروها").fill("کاربر آزمون رزرو");
  await expect(page.getByText("کاربر آزمون رزرو").first()).toBeVisible();

  await page.setViewportSize({ width: 375, height: 720 });
  await page.getByRole("button", { name: "رزرو جدید" }).click();
  await expect(page.getByRole("dialog", { name: "ثبت رزرو جدید" })).toBeVisible();
  await page.getByRole("button", { name: /^تاریخ رزرو/ }).click();
  await expect(page.locator(".rmdp-calendar")).toBeVisible();
  await expect(page.getByRole("button", { name: "ثبت رزرو" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("desktop reservation sheet moves through the physical right edge", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const sheet = page.locator('[data-slot="sheet-content"]');
  await page.getByRole("button", { name: "رزرو جدید" }).click();
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveAttribute("data-side", "right");

  await page.waitForTimeout(250);
  const settledBox = await sheet.boundingBox();
  expect(settledBox).not.toBeNull();
  expect(settledBox!.x + settledBox!.width).toBeCloseTo(1280, 0);

  await page.getByRole("button", { name: "Close" }).click();
  await expect.poll(async () => (await sheet.boundingBox())?.x ?? 0).toBeGreaterThan(settledBox!.x);
  await expect(sheet).not.toBeVisible();
});

test("manages reservation status from details and persists it after reload", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const pendingRow = page.getByRole("row", { name: /ترانه حسینی/ });
  await pendingRow.getByRole("button", { name: "مشاهده جزئیات" }).click();
  const detailsDialog = page.getByRole("dialog", { name: "جزئیات رزرو" });
  await expect(detailsDialog).toBeVisible();
  await expect(detailsDialog.getByText("۱۴۰۵/۰۷/۲۶")).toBeVisible();
  await page.getByRole("combobox", { name: "وضعیت جدید" }).click();
  await page.getByRole("option", { name: "تأیید شده" }).click();
  await page.getByRole("button", { name: "ثبت تغییر وضعیت" }).click();
  await expect(page.getByRole("dialog")).toContainText("تأیید شده");

  await page.reload();
  await page.getByLabel("جستجوی رزروها").fill("ترانه حسینی");
  await expect(page.getByRole("row", { name: /ترانه حسینی.*تأیید شده/ })).toBeVisible();

  await page
    .getByRole("row", { name: /ترانه حسینی/ })
    .getByRole("button")
    .click();
  await page.getByRole("combobox", { name: "وضعیت جدید" }).click();
  await page.getByRole("option", { name: "لغو شده" }).click();
  await page.getByRole("button", { name: "ثبت تغییر وضعیت" }).click();
  await expect(page.getByRole("dialog", { name: "تأیید لغو رزرو" })).toContainText("ترانه حسینی");
  await page.getByRole("button", { name: "تأیید لغو رزرو" }).click();
  await expect(page.getByRole("dialog")).toContainText("لغو شده");
  await expect(page.getByRole("combobox", { name: "وضعیت جدید" })).toHaveCount(0);
});

test("opens reservation details from a mobile card", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 });
  await page.goto("/");

  const mobileList = page.getByLabel("فهرست رزروها در موبایل");
  const mobileCard = mobileList.getByRole("button", { name: /مشاهده جزئیات رزرو/ }).first();
  await expect(mobileCard).toContainText("کیمیا مرادی");
  await expect(mobileCard).not.toContainText("مشاهده جزئیات");
  await mobileCard.click();

  await expect(page.getByRole("dialog", { name: "جزئیات رزرو" })).toBeVisible();
  await expect(page.getByText("نام مشتری")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

for (const viewport of [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1366", width: 1366, height: 768 },
]) {
  test(`keeps reservation representation compact and usable at ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    if (viewport.width < 768) {
      const firstCard = page.getByLabel("فهرست رزروها در موبایل").getByRole("button").first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard).toHaveCSS("padding-top", "12px");
      await expect(page.getByRole("table")).not.toBeVisible();
    } else {
      await expect(page.getByRole("table")).toBeVisible();
      await expect(page.getByLabel("فهرست رزروها در موبایل")).not.toBeVisible();
    }

    if (viewport.width < 640) {
      await expect(page.getByTestId("reservation-statistics-mobile-grid")).toBeVisible();
      await expect(page.getByTestId("reservation-statistics-desktop-grid")).not.toBeVisible();
    } else {
      await expect(page.getByTestId("reservation-statistics-mobile-grid")).not.toBeVisible();
      await expect(page.getByTestId("reservation-statistics-desktop-grid")).toBeVisible();
    }

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);

    await page.screenshot({
      path: `test-results/ui-mobile-01-${viewport.name}.png`,
      fullPage: true,
    });
  });
}

for (const viewport of [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 375, height: 812 },
]) {
  test(`Escape dismisses only the Jalali calendar on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    const formTrigger = page.getByRole("button", { name: "رزرو جدید" });
    await formTrigger.click();
    const form = page.getByRole("dialog", { name: "ثبت رزرو جدید" });
    await expect(form).toBeVisible();
    await page.locator("#reservation-customer-name").fill("نام حفظ‌شده");

    const dateTrigger = page.getByRole("button", { name: /^تاریخ رزرو/ });
    await dateTrigger.click();
    await expect(page.locator(".rmdp-calendar")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".rmdp-calendar")).not.toBeVisible();
    await expect(form).toBeVisible();
    await expect(page.locator("#reservation-customer-name")).toHaveValue("نام حفظ‌شده");
    await expect(dateTrigger).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(form).not.toBeVisible();
    await expect(formTrigger).toBeFocused();
  });
}

test("shows the reservation details tooltip without changing the accessible action name", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");

  const detailsButton = page
    .getByRole("row", { name: /ترانه حسینی/ })
    .getByRole("button", { name: "مشاهده جزئیات" });
  await detailsButton.hover();

  await expect(page.getByRole("tooltip")).toHaveText("مشاهده جزئیات");
  await expect(detailsButton).toHaveAccessibleName("مشاهده جزئیات");
});

test("confirms a pending reservation and updates the dashboard KPI after refresh", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await expect(
    page.getByTestId("reservation-statistics-desktop-grid").getByText("کل رزروها"),
  ).toBeVisible();

  const confirmedKpi = page
    .getByTestId("reservation-statistics-desktop-grid")
    .getByText("تأییدشده")
    .locator("..")
    .locator("..");
  await expect(confirmedKpi).toContainText("5");

  await page
    .getByRole("row", { name: /ترانه حسینی/ })
    .getByRole("button", { name: "مشاهده جزئیات" })
    .click();
  await page.getByRole("combobox", { name: "وضعیت جدید" }).click();
  await page.getByRole("option", { name: "تأیید شده" }).click();
  await page.getByRole("button", { name: "ثبت تغییر وضعیت" }).click();
  await expect(confirmedKpi).toContainText("6");

  await page.reload();
  await expect(confirmedKpi).toContainText("6");
});

test("keeps Tab and Shift+Tab focus within the create-reservation dialog", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  await page.getByRole("button", { name: "رزرو جدید" }).click();
  await page.locator("#reservation-customer-name").focus();

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Tab");
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
    expect(
      await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null),
    ).toBe(true);
  }

  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press("Shift+Tab");
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
    expect(
      await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null),
    ).toBe(true);
  }
});

for (const viewport of [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 375, height: 812 },
]) {
  test(`shows reservation filter and sort tooltips on hover and focus on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    const filter = page.getByRole("combobox", { name: "فیلتر وضعیت رزروها" });
    const sort = page.getByRole("combobox", { name: /مرتب‌سازی رزروها/ });

    await filter.hover();
    await expect(page.getByRole("tooltip")).toHaveText("فیلتر وضعیت رزروها");
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).not.toBeVisible();

    await sort.focus();
    await expect(page.getByRole("tooltip")).toHaveText("مرتب‌سازی رزروها");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).not.toBeVisible();
    await expect(sort).toHaveAccessibleName("مرتب‌سازی رزروها: جدیدترین ابتدا");
  });
}
