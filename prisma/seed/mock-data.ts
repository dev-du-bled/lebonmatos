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

async function loadMockImages(): Promise<string[]> {
    const imagesDir = path.join(process.cwd(), "data", "mock_images");
    if (!fs.existsSync(imagesDir)) {
        console.warn(
            `Warning: Image directory not found at ${imagesDir}. No mock images will be seeded.`
        );
        return [];
    }

    const files = fs
        .readdirSync(imagesDir)
        .filter((f) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f));
    const images: string[] = [];

    for (const file of files) {
        const filePath = path.join(imagesDir, file);
        const buffer = fs.readFileSync(filePath);
        const mimeType = `image/${file.split(".").pop()}`; // Simple mime type guess
        const blob = new Blob([buffer], { type: mimeType });
        try {
            // @ts-expect-error idc
            const base64 = await FileToBase64(blob);
            images.push(base64);
        } catch (error) {
            console.error(`Error converting ${file} to base64:`, error);
        }
    }
    return images;
}

async function main() {
    console.log("Start seeding...");

    const users = await addUsers(5);
    console.log(`Added ${users.length} users`);

    const loadedImages = await loadMockImages();
    console.log(`Loaded ${loadedImages.length} mock images for posts.`);

    for (const component of await prisma.component.findMany({
        take: 20,
    })) {
        const user = faker.helpers.arrayElement(users);
        const post = await prisma.post.create({
            data: {
                title: `${component.type} ${component.name}`,
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
                        Math.random() < 0.95
                            ? [
                                  {
                                      image:
                                          loadedImages.length > 0
                                              ? faker.helpers.arrayElement(
                                                    loadedImages
                                                )
                                              : "",
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
