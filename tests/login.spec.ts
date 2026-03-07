import { expect, test } from "@playwright/test";
import { TEST_USER } from "./global.setup";

test.describe.serial("Login", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
    });

    test("Login form input validation", async ({ page }) => {
        await page.getByRole("textbox", { name: "Email" }).fill("test@test.c");
        await page.getByRole("textbox", { name: "Mot de passe" }).fill("test");
        await page.getByRole("button", { name: "Se connecter" }).click();
        await expect(
            page.getByText("Veuillez entrer une adresse email valide")
        ).toBeVisible();
        await expect(
            page.getByText("Veuillez entrer une adresse email valide")
        ).toBeVisible();
    });

    test("Login with incorrect creds", async ({ page }) => {
        await page
            .getByRole("textbox", { name: "Email" })
            .fill(TEST_USER.email);
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill("wrongpassword");
        await page.getByRole("button", { name: "Se connecter" }).click();
        await expect(
            page.getByText("Email ou mot de passe incorrect")
        ).toBeVisible({
            timeout: 10_000,
        });
    });

    test("Login with correct creds", async ({ page }) => {
        await page
            .getByRole("textbox", { name: "Email" })
            .fill(TEST_USER.email);
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill(TEST_USER.password);
        await page.getByRole("button", { name: "Se connecter" }).click();
        await page.waitForURL("/", { timeout: 20_000 });
    });
});
