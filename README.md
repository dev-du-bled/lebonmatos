# LeBonMatos

L'expérience du pc de seconde main simplifiée.

## Démarrer le projet

### Version de développement

Pour démarrer le serveur de développement, exécuter les étapes suivantes :

1. `bun install` installer les dépendances
2. `bun dev:docker` démarrer le conteneur Docker de la base de données de dev
3. `bun prisma:generate` générer les modèles Prisma
4. `bun prisma:push` appliquer les migrations à la base de données
5. `bun sync:reset` initialiser meilisearch
6. `bun sync:all` synchroniser meilisearch la base de donnée
7. `bun sync:start` démarer le service de synchronisation
> [!warning]
> Toujours démarer le service de synchronisation **après** avoir seed la base de donnée avec les données des composants
6. `bun dev` démarrer le serveur de développement

### Version de production avec Docker

1. `cp .env.example .env.docker`
2. Remplir les clées google recaptcha (et autres clées si besoin) dans le fichier `.env.docker`
3. `docker compose up -d`
