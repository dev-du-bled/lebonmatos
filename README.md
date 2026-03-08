<div align="center">
    <img src="./src/assets/logo/dark.png" alt="LeBonMatos Logo" width="375"/>
<br />
<h3>L'expérience du pc de seconde main simplifiée.</h3>
</div>

## Prérequis

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)

## Version de développement

Pour démarrer le serveur de développement, exécuter les étapes suivantes :

1. `bun install` installer les dépendances
2. `bun dev:docker` démarrer les services de l'app (base de données, meilisearch)
3. `bun prisma:generate` générer les types Prisma
4. `bun prisma:push` appliquer les migrations
5. `bun prisma:data` seed les données des composants en base de donnée
6. `bun prisma:mockdata` seed des données de tests en base de donnée **(optionnel)**
7. `bun sync:all` synchroniser meilisearch avec la base de donnée

> [!WARNING]
> Toujours démarrer le service de synchronisation **après** avoir seed la base de donnée avec les données des composants

8. `bun dev` démarrer le serveur de développement

## Version de production avec Docker

1. `cp .env.example .env.production`

- Renseigner les différentes clés dans le fichier `.env.production`. <br />

> [!NOTE]
> _[BetterAuth](https://better-auth.com/docs/installation#set-environment-variables)_, _[reCAPTCHA](https://www.google.com/recaptcha/admin/create?hl=fr)_ et _[Resend](https://resend.com/api-keys)_ sont les 3 services externes utilisés nécessitant des clés d'API.

3. `docker compose up -d` lancer les services de l'app (base de données, meilisearch, serveur de production)

## Exécuter les tests

1. `cp .env.example .env.test`

> [!NOTE]
> On test sur un build de production pour éviter d'avoir des timeout lors de l'exécution des test (dû a la compilation des pages) et aussi réduire le temps d'exécution des tests.

> [!IMPORTANT]
> Cette commande de build mets la variable d'environnment `NEXT_PUBLIC_TESTS_ENV` à `true` pour désactiver le captcha et le rate limiting pendant les tests. <br /> **Ne pas utiliser ce build ou mettre à `true` cette variable en dehors de l'environnement de test pour éviter des problèmes de sécurité.**

2. `bun tests:build` build une version de production pour les tests

3. `bun tests:run` exécuter les tests _(prépare la base de données puis exécute les tests)_
