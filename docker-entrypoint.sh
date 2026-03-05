#!/bin/sh
set -e

echo "=== LeBonMatos Startup ==="

# --- Wait for PostgreSQL ---
echo "Waiting for PostgreSQL..."
until bun -e "import{Client}from'pg';const c=new Client(process.env.DATABASE_URL);await c.connect();await c.end();" 2>/dev/null; do
    sleep 3
done
echo "PostgreSQL is ready."

# --- Run migrations ---
echo "Running database migrations..."
bunx prisma migrate deploy --schema=./prisma/schema/schema.prisma
echo "Migrations applied."

# --- Seed component data (idempotent, skips existing) ---
echo "Seeding component data..."
bun ./prisma/seed/data.ts
echo "Component data seeded."

# --- Initialize Meilisearch ---
if [ -n "$MEILI_HOST" ]; then
    echo "Waiting for Meilisearch at $MEILI_HOST..."
    until wget -qO- "$MEILI_HOST/health" 2>/dev/null | grep -q "available"; do
        sleep 3
    done

    echo "Resetting Meilisearch indexes..."
    bun ./sync/resetMeili.ts

    echo "Syncing data to Meilisearch..."
    bun ./sync/syncAll.ts
    echo "Meilisearch sync complete."
else
    echo "MEILI_HOST not set, skipping Meilisearch."
fi

echo "=== Starting application ==="
exec "$@"
