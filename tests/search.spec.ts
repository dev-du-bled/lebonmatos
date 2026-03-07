import { test, expect } from "@playwright/test";

test.describe("Search", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/search");
    });

    test("Search with results count", async ({ page }) => {
        const searchInput = page.getByPlaceholder("ex: céléron...").first();
        await searchInput.fill("amd");

        await page.waitForLoadState("networkidle");
        await expect(
            page.locator("text=/[1-9]\\d*\\s+résultat/").first()
        ).toBeVisible({
            timeout: 10_000,
        });
    });

    test("Search with component filter", async ({ page }) => {
        await page.getByRole("textbox", { name: "ex: céléron..." }).fill("amd");
        await page
            .getByRole("button", { name: "Sélectionner un composant..." })
            .click();
        await page.getByRole("button", { name: "Processeur" }).click();
        await page
            .getByRole("textbox", { name: "Rechercher un processeur..." })
            .fill("amd ryzen 7 5700");
        await page
            .getByRole("button", { name: "AMD Ryzen 7 5700 Cœurs: 8 •" })
            .click();

        const firstComponent = page.getByText("AMD Ryzen 7 5700").first();
        await page.waitForLoadState("networkidle");
        await expect(firstComponent).toBeVisible({ timeout: 10_000 });
    });

    test("Search with no results", async ({ page }) => {
        const searchInput = page.getByPlaceholder("ex: céléron...").first();
        await searchInput.fill("componentthatisinexistant1234567890");

        await expect(page.getByText("0 résultat").first()).toBeVisible({
            timeout: 10_000,
        });
    });
});
