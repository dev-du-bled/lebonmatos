import { prisma } from "../src/lib/prisma";
import { TEST_USER } from "./global.setup";

export default async function globalTeardown() {
    console.log("[Teardown] Cleaning up test data...");

    await prisma.user.deleteMany({
        where: {
            email: {
                in: [TEST_USER.email, "testsignup@example.com"],
            },
        },
    });
    await prisma.$disconnect();

    console.log("[Teardown] Test teardown complete.");
}
