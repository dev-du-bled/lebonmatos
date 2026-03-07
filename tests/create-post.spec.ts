import { expect, test } from "@playwright/test";
import { TEST_USER } from "./global.setup";

test.describe("Create Post", () => {
    test.beforeEach("Login before each test", async ({ page }) => {
        await page.goto("/login");
        await page
            .getByRole("textbox", { name: "Email" })
            .fill(TEST_USER.email);
        await page
            .getByRole("textbox", { name: "Mot de passe" })
            .fill(TEST_USER.password);
        await page.getByRole("button", { name: "Se connecter" }).click();
        await page.waitForURL("/", { timeout: 20_000 });
        await page.goto("/create-post");
    });

    test("Create valid post", async ({ page }) => {
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
        await page
            .getByRole("textbox", { name: "Titre de l'annonce *" })
            .fill("Processeur puissant ");
        await page
            .getByRole("textbox", { name: "Description détaillée *" })
            .fill("processeur acheté en 2023 puissant marche tres bien");
        await page.getByPlaceholder("0.00").fill("300");
        await page
            .getByRole("textbox", { name: "Localisation *" })
            .fill("Nevers");
        await page
            .getByRole("button", { name: "Nevers Bourgogne – Franche-" })
            .click();
        await page.getByRole("button", { name: "Publier l'annonce" }).click();
        await page.waitForURL("/post/*", { timeout: 20_000 });
        await expect(page.getByText("AMD Ryzen 7")).toBeVisible();
        await expect(page.getByText("300 €")).toBeVisible();
        await expect(page.getByText("processeur acheté en 2023")).toBeVisible();
        await expect(
            page.getByText("Nevers - Bourgogne – Franche-")
        ).toBeVisible();

        await page.getByRole("button", { name: "Menu utilisateur" }).click();
        await page.getByRole("menuitem", { name: "Mon profil" }).click();
        await page.getByRole("link", { name: "Mes annonces Voir mes" }).click();
        await expect(page.getByText("AMD Ryzen 7")).toBeVisible();
        await expect(page.getByText("300 €")).toBeVisible();
    });

    test("Create Post form input validation", async ({ page }) => {
        await page
            .getByRole("textbox", { name: "Titre de l'annonce *" })
            .fill("a");
        await page
            .getByRole("textbox", { name: "Description détaillée *" })
            .fill("petite desc");
        await page.getByPlaceholder("0.00").fill("");

        await page.getByRole("textbox", { name: "Localisation *" }).fill("eee");
        // cross btn to clear the location input and trigger validation
        await page
            .locator("form")
            .getByRole("button")
            .filter({ hasText: /^$/ })
            .click();
        await expect(
            page
                .locator("form")
                .getByRole("button")
                .filter({ hasText: "Publier l'annonce" })
        ).toBeDisabled();
        await expect(
            page.getByText("Le titre doit contenir entre")
        ).toBeVisible();
        await expect(
            page.getByText("La description doit contenir")
        ).toBeVisible();
        await expect(
            page.getByText("Le prix doit être supérieur")
        ).toBeVisible();
        await expect(
            page.getByText("Vous devez sélectionner une")
        ).toBeVisible();
    });
});
