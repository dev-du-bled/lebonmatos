import { expect, test } from "@playwright/test";

test.describe("Login", () => {
    test.beforeAll(async ({ request }) => {
        await request.post("/api/auth/sign-up/email", {
            data: {
                name: "Test User",
                email: "test@test.com",
                password: "testpassword",
            },
        });
    });

    test.afterAll(async ({ request }) => {
        await request.post("/api/auth/delete-user", {
            data: {
                email: "test@test.com",
            },
        });
    });

    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
    });

    test("Login form input validation", async ({ page }) => {
        await page.getByRole("textbox", { name: "Email" }).click();
        await page.getByRole("textbox", { name: "Email" }).fill("test@test.c");
        await page.getByRole("textbox", { name: "Mot de passe" }).click();
        await page.getByRole("textbox", { name: "Mot de passe" }).fill("test");
        await page.getByRole("button", { name: "Se connecter" }).click();
        await expect(
            page.getByText("Veuillez entrer une adresse email valide")
        ).toBeVisible();
        await expect(
            page.getByText("Veuillez entrer une adresse")
        ).toBeVisible();
    });

    test("Login with correct creds", async ({ page }) => {
        await page.getByRole("textbox", { name: "Email" }).click();
        await page
            .getByRole("textbox", { name: "Email" })
            .fill("test@test.com");
        await page.getByRole("textbox", { name: "Email" }).press("Tab");
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill("testpassword");
        await page.getByRole("button", { name: "Se connecter" }).click();
        await page.waitForURL("/", { timeout: 10_000 });
    });

    test("Login with incorrect creds", async ({ page }) => {
        await page.getByRole("textbox", { name: "Email" }).click();
        await page
            .getByRole("textbox", { name: "Email" })
            .fill("test@test2.com");
        await page.getByRole("textbox", { name: "Email" }).press("Tab");
        await page
            .getByRole("link", { name: "Mot de passe oublié ?" })
            .press("Tab");
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill("testpassss");
        await page.getByRole("button", { name: "Se connecter" }).click();
        await expect(page.getByText("Invalid email or password")).toBeVisible();
    });
});
