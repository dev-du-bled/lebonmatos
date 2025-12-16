import Advert from "@/components/home-page/advert";
import PostCarousel from "@/components/home-page/post-carousel";
import { prisma } from "@/lib/prisma";

export default async function Home() {
    const posts = await prisma.post.findMany({
        take: 10,
        include: {
            user: true,
            images: true,
        },
        where: {
            images: {
                some: {
                    image: {
                        not: undefined,
                    },
                },
            },
        },
    });

    const cases = await prisma.post.findMany({
        take: 10,
        include: {
            user: true,
            images: true,
            component: {
                select: {
                    type: true,
                },
            },
        },
        where: {
            component: {
                type: "CASE",
            },
        },
    });

    const cpus = await prisma.post.findMany({
        take: 10,
        include: {
            user: true,
            images: true,
            component: {
                select: {
                    type: true,
                },
            },
        },
        where: {
            component: {
                type: "CPU",
            },
        },
    });

    const gpus = await prisma.post.findMany({
        take: 10,
        include: {
            user: true,
            images: true,
            component: {
                select: {
                    type: true,
                },
            },
        },
        where: {
            component: {
                type: "GPU",
            },
        },
    });

    return (
        <div className="wide-lock font-serif w-[70%] flex flex-col justify-center gap-3 mb-3!">
            <PostCarousel
                headerText="En recherche de Matos?"
                fullHeight={true}
                posts={posts}
            />
            <Advert />
            <PostCarousel headerText="Boitiers de PC" posts={cases} />
            <PostCarousel headerText="Processeurs" posts={cpus} />
            <PostCarousel headerText="Cartes Graphiques" posts={gpus} />
        </div>
    );
}
