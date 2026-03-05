import {
    Html,
    Head,
    Body,
    Container,
    Img,
    Text,
    Button,
    Section,
    Hr,
    Tailwind,
} from "@react-email/components";

const baseUrl =
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

interface ResetPasswordEmailProps {
    url: string;
    userName?: string;
}

export default function ResetPasswordEmail({
    url,
    userName,
}: ResetPasswordEmailProps) {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="bg-[#f5f5f5] font-sans">
                    <Container className="mx-auto max-w-[560px] rounded-[10px] border border-[#e5e5e5] bg-white px-5 py-10">
                        <Section className="mb-4 text-center">
                            <Img
                                src={`${baseUrl}/logo-full-dark.png`}
                                width="200"
                                alt="LeBonMatos"
                                className="mx-auto"
                            />
                        </Section>
                        <Text className="mb-6 text-center text-lg font-semibold text-[#171717]">
                            Reinitialisation de votre mot de passe
                        </Text>
                        <Text className="text-sm leading-6 text-[#737373]">
                            Bonjour{userName ? ` ${userName}` : ""},
                        </Text>
                        <Text className="text-sm leading-6 text-[#737373]">
                            Vous avez demande la reinitialisation de votre mot
                            de passe. Cliquez sur le bouton ci-dessous pour en
                            choisir un nouveau :
                        </Text>
                        <Section className="my-6 text-center">
                            <Button
                                className="rounded-md bg-[#FFF200] px-6 py-3 text-sm font-semibold text-[#171717] no-underline"
                                href={url}
                            >
                                Reinitialiser mon mot de passe
                            </Button>
                        </Section>
                        <Text className="text-sm leading-6 text-[#737373]">
                            Si vous n&apos;avez pas demande cette
                            reinitialisation, vous pouvez ignorer cet email en
                            toute securite. Votre mot de passe restera
                            inchange.
                        </Text>
                        <Hr className="my-6 border-[#e5e5e5]" />
                        <Text className="text-center text-xs leading-4 text-[#a1a1a1]">
                            Ce lien expirera dans 1 heure. Pour des raisons de
                            securite, ne partagez ce lien avec personne.
                        </Text>
                        <Text className="text-center text-xs leading-4 text-[#a1a1a1]">
                            LeBonMatos - La plateforme de partage de materiel
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
