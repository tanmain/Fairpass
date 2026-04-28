#!/bin/sh
set -e

echo "Pushing database schema..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss 2>&1 || echo "Schema push encountered an issue, continuing..."

echo "Starting FairPass..."
exec node server.js
