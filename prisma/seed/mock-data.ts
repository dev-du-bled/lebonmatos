import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Faker, fr } from "@faker-js/faker";
import mockImages from "../../data/mock-images.json";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const faker = new Faker({
    locale: [fr],
});

// Templates to have more realistic posts
const titleTemplates: Record<string, string[]> = {
    CPU: [
        "Vends processeur ${name}",
        "Proc ${name} occasion",
        "${name} comme neuf",
        "Processeur ${name} à vendre",
        "Vends ${name} très bon état",
        "${name} quasi neuf, jamais OC",
        "Proc ${name} sous garantie",
        "Vends ${name} dans sa boîte",
        "${name} cause upgrade",
        "Processeur ${name} parfait état",
        "CPU Puissant",
    ],
    GPU: [
        "Carte graphique ${name}",
        "Vends CG ${name}",
        "${name} très bon état",
        "Carte ${name} jamais overclockée",
        "Vends ${name} cause upgrade",
        "CG ${name} comme neuve",
        "${name} avec boîte d'origine",
        "Carte graphique ${name} occasion",
        "Vends ma ${name} gaming",
        "${name} peu utilisée",
        "Carte graphique Gaming",
    ],
    MOTHERBOARD: [
        "Carte mère ${name}",
        "Vends CM ${name}",
        "${name} avec boîte et accessoires",
        "Carte mère ${name} occasion",
        "Vends carte ${name} bon état",
        "${name} parfait fonctionnement",
        "CM ${name} comme neuve",
        "Carte mère ${name} à saisir",
        "${name} cause changement config",
        "Vends ma carte mère ${name}",
        "mobo pas cher",
    ],
    RAM: [
        "Barrettes mémoire ${name}",
        "Kit RAM ${name}",
        "Vends ${name} mémoire PC",
        "Mémoire ${name} quasi neuve",
        "${name} excellent état",
        "Vends RAM ${name}",
        "Kit mémoire ${name} jamais OC",
        "${name} avec emballage",
        "Barrettes ${name} comme neuves",
        "Vends mémoire ${name} cause upgrade",
    ],
    SSD: [
        "SSD ${name} très rapide",
        "Vends SSD ${name}",
        "Disque ${name} comme neuf",
        "${name} état impeccable",
        "SSD ${name} cause upgrade",
        "${name} quasi neuf",
        "Vends disque SSD ${name}",
        "SSD ${name} très peu utilisé",
        "${name} santé 100%",
        "Vends ${name} parfait état",
        "ssd peu utilisé",
    ],
    HDD: [
        "Disque dur ${name}",
        "Vends HDD ${name}",
        "${name} parfait état",
        "DD ${name} peu utilisé",
        "Disque ${name} bon état",
        "Vends ${name} fonctionnel",
        "HDD ${name} sans secteurs défectueux",
        "${name} cause passage SSD",
        "Disque dur ${name} occasion",
        "Vends disque ${name} très bon état",
        "Disque dur",
    ],
    POWER_SUPPLY: [
        "Alimentation ${name}",
        "Vends alim ${name}",
        "${name} modulaire",
        "Alim PC ${name} très bon état",
        "Vends alimentation ${name}",
        "${name} comme neuve",
        "Alimentation ${name} cause upgrade",
        "Vends ${name} avec câbles",
        "${name} silencieuse",
        "Alim ${name} parfait état",
    ],
    CPU_COOLER: [
        "Ventirad ${name}",
        "Vends refroidisseur ${name}",
        "${name} excellent état",
        "Cooler ${name} comme neuf",
        "Vends ${name} très silencieux",
        "Refroidisseur ${name} occasion",
        "${name} avec pâte thermique",
        "Ventirad ${name} cause changement",
        "Vends ventirad ${name}",
        "${name} parfait pour gaming",
    ],
    CASE: [
        "Boîtier ${name}",
        "Vends tour ${name}",
        "${name} très bon état",
        "Tour PC ${name} occasion",
        "Boîtier ${name} comme neuf",
        "Vends boîtier ${name}",
        "${name} avec ventilateurs inclus",
        "Tour ${name} bon état",
        "Boîtier ${name} cause changement",
        "Vends ${name} gaming",
    ],
    CASE_FAN: [
        "Ventilateur ${name}",
        "Vends ventilos ${name}",
        "${name} état neuf",
        "Ventilo ${name} silencieux",
        "Vends ${name} lot",
        "${name} comme neuf",
        "Ventilateurs ${name} RGB",
        "Vends ${name} très bon état",
        "${name} quasi neuf",
        "Lot ventilateurs ${name}",
    ],
    SOUND_CARD: [
        "Carte son ${name}",
        "Vends carte audio ${name}",
        "${name} état neuf",
        "Carte son ${name} occasion",
        "Vends ${name} bon état",
        "${name} qualité audio top",
        "Carte son ${name} comme neuve",
        "Vends ${name} cause upgrade audio",
    ],
    WIRELESS_NETWORK_CARD: [
        "Carte WiFi ${name}",
        "Vends carte réseau ${name}",
        "${name} PCIe très bon état",
        "Carte réseau sans fil ${name}",
        "Vends ${name} WiFi",
        "${name} comme neuve",
        "Carte sans fil ${name} occasion",
        "Vends ${name} bon fonctionnement",
    ],
};

const MAX_TITLE_LENGTH = 50;

function truncate(str: string, max: number): string {
    if (str.length <= max) return str;
    const truncated = str.slice(0, max);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
}

function generateTitle(componentName: string, componentType: string): string {
    const templates = titleTemplates[componentType] || [
        "Vends ${name}",
        "${name} bon état",
        "${name} occasion",
    ];
    const template = faker.helpers.arrayElement(templates);
    const title = template.replace("${name}", componentName);
    return truncate(title, MAX_TITLE_LENGTH);
}

function pickImages(componentType: string): string[] {
    const typeKey = componentType.toLowerCase() as keyof typeof mockImages;
    const typeImages = mockImages[typeKey] || [];

    if (typeImages.length === 0 || Math.random() >= 0.95) {
        return [];
    }

    return [faker.helpers.arrayElement(typeImages)];
}

// components to mocks
const ALL_COMPONENT_TYPES = [
    "CPU",
    "GPU",
    "MOTHERBOARD",
    "RAM",
    "SSD",
    "HDD",
    "POWER_SUPPLY",
    "CPU_COOLER",
    "CASE",
    "CASE_FAN",
    "SOUND_CARD",
    "WIRELESS_NETWORK_CARD",
] as const;

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

    // Fetch up to 20 components of each type and create posts
    for (const type of ALL_COMPONENT_TYPES) {
        const components = await prisma.component.findMany({
            where: { type },
            take: 20,
        });

        if (components.length === 0) {
            console.log(`No components found for type ${type}, skipping.`);
            continue;
        }

        for (const component of components) {
            const user = faker.helpers.arrayElement(users);
            const post = await prisma.post.create({
                data: {
                    title: generateTitle(component.name, component.type),
                    description: faker.lorem.paragraph(),
                    price: faker.number.int({
                        min: Math.max(
                            0,
                            (component.estimatedPrice || 100) - 100
                        ),
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
                    images: pickImages(component.type),
                },
            });
            console.log(`Created post [${component.type}] with id: ${post.id}`);
        }

        console.log(`Created ${components.length} posts for type ${type}`);
    }

    console.log("Adding ratings...");
    for (const user of users) {
        const ratingsCount = faker.number.int({ min: 0, max: 5 });
        const potentialRaters = users.filter((u) => u.id !== user.id);
        const raters = faker.helpers.arrayElements(
            potentialRaters,
            Math.min(ratingsCount, potentialRaters.length)
        );

        // Fetch posts owned by this user that are not yet sold
        const availablePosts = await prisma.post.findMany({
            where: { userId: user.id, isSold: false },
            select: { id: true },
        });

        for (const rater of raters) {
            if (availablePosts.length === 0) break;

            // Pick and remove a post from the available list so each post is used at most once
            const postIndex = faker.number.int({
                min: 0,
                max: availablePosts.length - 1,
            });
            const [post] = availablePosts.splice(postIndex, 1);

            // Mark the post as sold to the rater
            await prisma.post.update({
                where: { id: post.id },
                data: { isSold: true, boughtById: rater.id },
            });

            await prisma.rating.create({
                data: {
                    userId: user.id,
                    raterId: rater.id,
                    postId: post.id,
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
