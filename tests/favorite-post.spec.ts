import { test, expect } from "@playwright/test";
import { TEST_USER } from "./global.setup";

test.describe("Favorite Post", () => {
    test.beforeEach("Login before each test", async ({ page }) => {
        await page.goto("/login");
        await page
            .getByRole("textbox", { name: "Email" })
            .fill(TEST_USER.email);
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill(TEST_USER.password);
        await page.getByRole("button", { name: "Se connecter" }).click();
        await page.waitForURL("/", { timeout: 10_000 });
    });

    test("Add and remove a post from favorites", async ({ page }) => {
        await page.getByRole("link").nth(3).click();
        await page.getByRole("button").nth(5).click();

        const title = await page
            .locator(
                "body > main > div.flex-1 > div > div.flex.flex-col.lg\:grid.lg\:grid-cols-3.gap-8.lg\:items-start > div.lg\:col-span-2.lg\:col-start-1.lg\:row-start-1.relative.rounded-xl.shadow-md.overflow-hidden.bg-muted > div.absolute.bottom-0.left-0.right-0.bg-linear-to-t.from-black\/80.via-black\/40.to-transparent.p-6.pt-20.pointer-events-none > h1"
            )
            .first()
            .textContent();

        await page.getByRole("button", { name: "Menu utilisateur" }).click();
        await page.getByRole("menuitem", { name: "Mon profil" }).click();
        await page
            .getByRole("link", { name: "Favoris Voir mes annonces" })
            .click();
        await expect(page.getByRole("main")).toContainText(title as string);
    });
});
