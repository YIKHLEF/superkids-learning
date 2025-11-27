#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env.mock}"

if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️  Fichier d'environnement manquant: $ENV_FILE" >&2
  echo "Copiez $ROOT_DIR/.env.mock.example vers $ENV_FILE et ajustez les valeurs." >&2
  exit 1
fi

cd "$ROOT_DIR"

# Charger les variables d'environnement
set -a
. "$ENV_FILE"
set +a

echo "🚀 Démarrage du déploiement mock (build + seed)"
docker compose -f docker-compose.yml -f docker-compose.mock.yml up -d --build

echo "⌛ Attente du démarrage du backend..." 
docker compose logs -f backend
