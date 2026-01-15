import Advert from "@/components/home-page/advert";
import PostCarousel from "@/components/home-page/post-carousel";
import { trpc } from "@/trpc/server";

export default async function Home() {
    const { posts, cases, cpus, gpus } = await trpc.posts.getHomePage();

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
