import { ConfiguratorContent } from "@/components/configurator/configurator-content";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Configurateur PC",
    description: "Créez votre PC sur mesure en sélectionnant vos composants.",
};

export default function ConfiguratorPage() {
    return <ConfiguratorContent />;
}
