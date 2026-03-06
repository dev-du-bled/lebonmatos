import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Faker, fr } from "@faker-js/faker";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
                title: component.name.slice(0, 50),
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
                location: {
                    create: {
                        lat: faker.location.latitude(),
                        lon: faker.location.longitude(),
                        name: faker.location.city(),
                        displayName: faker.location.city(),
                        city: faker.location.city(),
                        state: faker.location.state(),
                        region: faker.location.state(),
                        country: faker.location.country(),
                        countryCode: faker.helpers.arrayElement([
                            "FR",
                            "US",
                            "GB",
                            "DE",
                            "ES",
                            "IT",
                            "CA",
                        ]),
                        coordinates: [
                            faker.location.longitude(),
                            faker.location.latitude(),
                        ],
                    },
                },
                images:
                    Math.random() < 0.8
                        ? [
                              `https://pinjasaur-unsplashsourcereimplementation.web.val.run/?query=${component.type.toLowerCase()}`,
                          ]
                        : [],
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
