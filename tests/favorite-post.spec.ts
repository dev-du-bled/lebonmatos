import { test, expect } from "@playwright/test";
import { TEST_USER } from "./global.setup";

test.describe.serial("Favorite Post", () => {
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

    test("Favorite a post", async ({ page }) => {
        const postLink = page.locator('a[href^="/post/"]').first();
        await postLink.click();
        await page.waitForURL("**/post/**", { timeout: 10_000 });

        const title = await page.locator("h1").first().textContent();
        expect(title).toBeTruthy();

        const favoriteButton = page.getByRole("button", {
            name: "Ajouter aux favoris",
        });
        await expect(favoriteButton).toBeVisible({ timeout: 10_000 });
        await favoriteButton.click();

        await expect(
            page.getByRole("button", { name: "Retirer des favoris" })
        ).toBeVisible({ timeout: 10_000 });

        await page.getByRole("button", { name: "Menu utilisateur" }).click();
        await page.getByRole("menuitem", { name: "Mon profil" }).click();
        await page.waitForURL("**/profile", { timeout: 10_000 });
        await page
            .getByRole("link", { name: "Favoris Voir mes annonces" })
            .click();
        await page.waitForURL("**/profile/favorites", { timeout: 10_000 });

        await expect(page.getByText(title as string)).toBeVisible();
    });

    test("Unfavorite a post", async ({ page }) => {
        await page.goto("/profile/favorites");
        await page.getByRole("button", { name: "Retirer des favoris" }).click();
        await expect(page.getByText("Aucun Favoris")).toBeVisible();
    });
});
