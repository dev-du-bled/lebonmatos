import { test, expect } from "@playwright/test";
import { TEST_USER } from "./global.setup";

test.describe("Profile", () => {
    test.beforeEach("Login before each test", async ({ page }) => {
        await page.goto("/login");
        await page
            .getByRole("textbox", { name: "Email" })
            .fill(TEST_USER.email);
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill(TEST_USER.password);
        await page.getByRole("button", { name: "Se connecter" }).click();
        await page.waitForURL("/", { timeout: 30_000 });
    });

    test("Navigate to profile page and see quick actions", async ({ page }) => {
        await page.getByRole("button", { name: "Menu utilisateur" }).click();
        await page.getByRole("menuitem", { name: "Mon profil" }).click();
        await page.waitForURL("**/profile", { timeout: 10_000 });

        // Verify user welcome message
        await expect(page.getByText(TEST_USER.username)).toBeVisible({
            timeout: 10_000,
        });

        // Verify quick actions are visible
        await expect(
            page.getByRole("link", { name: "Paramètres du compte Gérer" })
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Mes annonces Voir mes annonces" })
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Favoris Voir mes annonces" })
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Avis Voir les avis" })
        ).toBeVisible();
    });

    test("Navigate to profile edit page", async ({ page }) => {
        await page.goto("/profile/edit");

        // Verify the form is loaded with current user data
        await expect(page.getByText("Information Personnelles")).toBeVisible({
            timeout: 10_000,
        });
        await expect(
            page.getByText("Coordonnées", { exact: true })
        ).toBeVisible();

        // Verify form fields are pre-filled
        const nameInput = page.getByRole("textbox", {
            name: "Nom complet (Légal)",
        });
        await expect(nameInput).toHaveValue(TEST_USER.name, {
            timeout: 10_000,
        });

        const emailInput = page.getByRole("textbox", { name: "Email" });
        await expect(emailInput).toHaveValue(TEST_USER.email);
    });

    test("Edit personal info validation", async ({ page }) => {
        await page.goto("/profile/edit");

        // Wait for form to load
        await expect(
            page.getByRole("textbox", { name: "Nom complet (Légal)" })
        ).toBeVisible({ timeout: 10_000 });

        // Clear the name field and set an invalid value
        await page
            .getByRole("textbox", { name: "Nom complet (Légal)" })
            .fill("a");

        // Clear email and set invalid
        await page.getByRole("textbox", { name: "Email" }).fill("invalid");

        // Submit the form
        await page.getByRole("button", { name: "Enregistrer" }).click();

        // Verify validation errors
        await expect(
            page.getByText("Le nom doit contenir au moins 2 caractères")
        ).toBeVisible();
        await expect(page.getByText("Email invalide")).toBeVisible();
    });

    test("Update personal info successfully", async ({ page }) => {
        await page.goto("/profile/edit");

        // Wait for form to load
        const nameInput = page.getByRole("textbox", {
            name: "Nom complet (Légal)",
        });
        await expect(nameInput).toBeVisible({ timeout: 10_000 });

        // Update the name
        await nameInput.fill("Test Login Updated");

        // Submit
        await page.getByRole("button", { name: "Enregistrer" }).click();

        // Verify success message
        await expect(
            page.getByText("Informations mises à jour avec succès")
        ).toBeVisible({ timeout: 10_000 });

        // Restore original name
        await nameInput.fill(TEST_USER.name);
        await page.getByRole("button", { name: "Enregistrer" }).click();
        await expect(
            page.getByText("Informations mises à jour avec succès")
        ).toBeVisible({ timeout: 10_000 });
    });

    test("Navigate to listings page", async ({ page }) => {
        await page.goto("/profile/listings");

        await expect(
            page.getByRole("heading", { name: "Mes annonces" })
        ).toBeVisible({ timeout: 10_000 });
    });

    test("Navigate to favorites page", async ({ page }) => {
        await page.goto("/profile/favorites");

        await expect(
            page.getByRole("heading", { name: "Mes favoris" })
        ).toBeVisible({ timeout: 10_000 });
    });
});
