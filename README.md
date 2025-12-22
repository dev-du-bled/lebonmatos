# LeBonMatos

L'expérience du pc de seconde main simplifiée.

## Démarrer le projet

### Version de développement

Pour démarrer le serveur de développement, exécuter les étapes suivantes :

1. `bun install` installer les dépendances
2. `bun dev:docker` démarrer le conteneur Docker de la base de données de dev
3. `bun prisma:generate` générer les modèles Prisma
4. `bunx prisma db push` appliquer les migrations à la base de données
5. `bun dev` démarrer le serveur de développement

### Version de production avec Docker

1. `cp .env.example .env`
2. Remplir les clées google recaptcha (et autres clées si besoin) dans le fichier `.env`
3. `docker compose up -d`
