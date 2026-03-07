import { prisma } from "../src/lib/prisma";
import { TEST_USER } from "./global.setup";

export default async function globalTeardown() {
    console.log("[Teardown] Cleaning up test data...");

    const testUsers = await prisma.user.findMany({
        where: {
            email: {
                in: [TEST_USER.email, "testsignup@example.com"],
            },
        },
        select: { id: true },
    });
    const userIds = testUsers.map((u) => u.id);

    await prisma.post.deleteMany({
        where: { userId: { in: userIds } },
    });
    await prisma.user.deleteMany({
        where: { id: { in: userIds } },
    });
    await prisma.$disconnect();

    console.log("[Teardown] Test teardown complete.");
}
