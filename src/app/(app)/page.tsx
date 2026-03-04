import Advert from "@/components/home-page/advert";
import PostCarousel from "@/components/home-page/post-carousel";
import { trpc } from "@/trpc/server";

export const metadata = {
    title: "Home",
    description: "Bienvenue sur notre site de vente de matériel informatique d'occasion ! Découvrez une large sélection de composants, d'ordinateurs portables et de périphériques à des prix compétitifs. Que vous soyez un passionné de technologie ou à la recherche d'une bonne affaire, notre plateforme vous offre une expérience d'achat facile et sécurisée. Explorez nos catégories variées et trouvez le matériel informatique d'occasion qui correspond à vos besoins dès aujourd'hui !",
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
