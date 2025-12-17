import { PrismaClient } from "@prisma/client";
import { Faker, fr } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import { FileToBase64 } from "../../src/utils/file";

const prisma = new PrismaClient();
const faker = new Faker({
    locale: [fr],
});

async function addUsers(count: number) {
    const users = [];
    for (let i = 0; i < count; i++) {
        const user = await prisma.user.create({
            data: {
                id: faker.string.uuid(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                username: faker.internet.username(),
                displayUsername: faker.internet.displayName(),
                emailVerified: faker.datatype.boolean(),
                image: faker.image.avatar(),
                phoneNumber: faker.phone.number(),
            },
        });
        users.push(user);
    }
    return users;
}

async function mockComponentImage(ctype: string): Promise<string> {
    const imagesDir = path.join(process.cwd(), "data", "mock_images", ctype);
    if (!fs.existsSync(imagesDir)) {
        console.warn(
            `Warning: Image directory for component ${ctype} not found at ${imagesDir}. No mock images will be for this component.`
        );
        return "";
    }

    const files = fs
        .readdirSync(imagesDir)
        .filter((f) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
    const choosenImage = files[Math.floor(Math.random() * files.length)];

    const filePath = path.join(imagesDir, choosenImage);
    const buffer = fs.readFileSync(filePath);
    const mimeType = `image/${choosenImage.split(".").pop()}`; // Simple mime type guess
    const blob = new Blob([buffer], { type: mimeType });
    try {
        // @ts-expect-error idc
        return await FileToBase64(blob);
    } catch (error) {
        console.error(`Error converting ${choosenImage} to base64:`, error);
        return "";
    }
}

async function main() {
    console.log("Start seeding...");

    const users = await addUsers(5);
    console.log(`Added ${users.length} users`);

    const cpus = await prisma.component.findMany({
        where: { type: "CPU" },
        take: 20,
    });
    const gpus = await prisma.component.findMany({
        where: { type: "GPU" },
        take: 20,
    });
    const cases = await prisma.component.findMany({
        where: { type: "CASE" },
        take: 20,
    });

    for (const component of [...cpus, ...gpus, ...cases]) {
        const user = faker.helpers.arrayElement(users);
        const post = await prisma.post.create({
            data: {
                title: `${component.name}`,
                description: faker.lorem.paragraph(),
                price: faker.number.int({
                    min: (component.estimatedPrice || 100) - 100,
                    max: (component.estimatedPrice || 100) + 100,
                }),
                user: {
                    connect: { id: user.id },
                },
                component: {
                    connect: { id: component.id },
                },
                location: `${faker.location.city().replace(" ", "-")} ${faker.location.zipCode()}`,
                images: {
                    create:
                        Math.random() < 0.8
                            ? [
                                  {
                                      image: await mockComponentImage(
                                          component.type
                                      ),
                                      alt: `Image of ${component.name}`,
                                      ownerId: user.id,
                                  },
                              ]
                            : [],
                },
            },
        });
        console.log(`Created post with id: ${post.id}`);
    }

    console.log("Adding ratings...");
    for (const user of users) {
        const ratingsCount = faker.number.int({ min: 0, max: 5 });
        const potentialRaters = users.filter((u) => u.id !== user.id);
        const raters = faker.helpers.arrayElements(
            potentialRaters,
            Math.min(ratingsCount, potentialRaters.length)
        );

        for (const rater of raters) {
            await prisma.rating.create({
                data: {
                    userId: user.id,
                    raterId: rater.id,
                    rating: faker.number.int({ min: 1, max: 5 }),
                    comment: faker.lorem.sentences(2),
                },
            });
        }
    }
    console.log("Ratings added.");

    console.log("Seeding finished.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
