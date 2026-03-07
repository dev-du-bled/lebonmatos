import { prisma } from "@/lib/prisma";
import { expect, test } from "@playwright/test";

const TEST_EMAIL = "testsignup@example.com";

test.describe.serial("Signup", () => {
    test.afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: TEST_EMAIL },
        });
        await prisma.$disconnect();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto("/signup");
    });

    test("Signup from input validation", async ({ page }) => {
        await page.getByRole("textbox", { name: "Nom complet" }).fill("t");
        await page
            .getByRole("textbox", { name: "Nom d'utilisateur" })
            .fill("test");
        await page.getByRole("textbox", { name: "Email" }).fill("test@test.c");
        await page
            .getByRole("textbox", { name: "Mot de passe", exact: true })
            .fill("test");
        await page
            .getByRole("textbox", { name: "Confirmer le mot de passe" })
            .fill("testt");
        await page.getByRole("button", { name: "Créer le compte" }).click();
        await expect(
            page.getByText("Le nom doit contenir au moins 2 caractères")
        ).toBeVisible();
        await expect(
            page.getByText(
                "Le nom d'utilisateur doit contenir au moins 5 caractères"
            )
        ).toBeVisible();
        await expect(
            page.getByText("Veuillez entrer une adresse email valide")
        ).toBeVisible();
        await expect(
            page.getByText(
                "Le mot de passe doit contenir au moins 6 caractères"
            )
        ).toBeVisible();
        await expect(
            page.getByText("Les mots de passe ne correspondent pas")
        ).toBeVisible();
    });

    test("Signup with valid data", async ({ page }) => {
        await page
            .getByRole("textbox", { name: "Nom complet" })
            .fill("Test Signup");
        await page
            .getByRole("textbox", { name: "Nom d'utilisateur" })
            .fill("testsignup");
        await page.getByRole("textbox", { name: "Email" }).fill(TEST_EMAIL);
        await page
            .getByRole("textbox", { name: "Mot de passe", exact: true })
            .fill("testpassword");
        await page
            .getByRole("textbox", { name: "Confirmer le mot de passe" })
            .fill("testpassword");
        await page.getByRole("button", { name: "Créer le compte" }).click();
        await page.waitForURL("/", { timeout: 20_000 });
    });

    test("Signup with existing email", async ({ page }) => {
        await page
            .getByRole("textbox", { name: "Nom complet" })
            .fill("Test Signup");
        await page
            .getByRole("textbox", { name: "Nom d'utilisateur" })
            .fill("testsignup2");
        await page.getByRole("textbox", { name: "Email" }).fill(TEST_EMAIL);
        await page
            .getByRole("textbox", { name: "Mot de passe", exact: true })
            .fill("testpassword");
        await page
            .getByRole("textbox", { name: "Confirmer le mot de passe" })
            .fill("testpassword");
        await page.getByRole("button", { name: "Créer le compte" }).click();
        await expect(
            page.getByText("User already exists. Use another email.")
        ).toBeVisible();
    });
});
