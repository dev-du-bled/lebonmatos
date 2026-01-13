#!/bin/sh
set -e

echo "Running Prisma migrations..."
bunx prisma migrate deploy --schema=./prisma/schema/schema.prisma

echo "Starting application..."
exec "$@"
