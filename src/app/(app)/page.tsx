import Advert from "@/components/home-page/advert";
import PostCarousel from "@/components/home-page/post-carousel";
import { trpc } from "@/trpc/server";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Accueil",
    description:
        "Bienvenue sur LeBonMatos, la plateforme d'annonces dédiée au matériel informatique d'occasion.",
};

export default async function Home() {
    const { posts, cases, cpus, gpus } = await trpc.posts.getHomePage();

    return (
        <div className="wide-lock font-serif flex flex-col justify-center gap-3 mb-12.5!">
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
