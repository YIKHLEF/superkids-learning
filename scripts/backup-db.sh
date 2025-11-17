#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=${BACKUP_DIR:-"./backups"}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
DATABASE_URL=${DATABASE_URL:-""}
S3_BUCKET=${S3_BUCKET:-""}
AWS_PROFILE=${AWS_PROFILE:-""}
TIMESTAMP=$(date +%Y%m%d%H%M%S)
FILENAME="superkids_backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${FILENAME}"

mkdir -p "${BACKUP_DIR}"

if [[ -n "${DATABASE_URL}" ]]; then
  echo "[backup] Dumping database via DATABASE_URL..."
  pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_PATH}"
else
  echo "[backup] Dumping database via pg_* environment variables..."
  pg_dump -h "${PGHOST:-localhost}" -U "${PGUSER:-postgres}" "${PGDATABASE:-superkids_learning}" | gzip > "${BACKUP_PATH}"
fi

echo "[backup] Backup written to ${BACKUP_PATH}"

if [[ -n "${S3_BUCKET}" ]]; then
  echo "[backup] Uploading backup to s3://${S3_BUCKET}/${FILENAME}"
  AWS_ARGS=""
  if [[ -n "${AWS_PROFILE}" ]]; then
    AWS_ARGS="--profile ${AWS_PROFILE}"
  fi
  aws ${AWS_ARGS} s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/${FILENAME}"
fi

echo "[backup] Cleaning backups older than ${BACKUP_RETENTION_DAYS} days"
find "${BACKUP_DIR}" -name "superkids_backup_*.sql.gz" -type f -mtime +"${BACKUP_RETENTION_DAYS}" -print -delete
