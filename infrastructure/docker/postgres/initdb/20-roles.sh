#!/bin/bash
# Creates least-privilege database roles. Runs ONCE, on first initialisation of an empty data
# volume (after the image's own 10_postgis.sh). To re-run, the volume must be recreated.
#
#   POSTGRES_USER    bootstrap superuser: init and emergency admin only, never used by the app
#   DB_MIGRATOR_USER owns schema objects, runs Alembic migrations (DDL)
#   DB_APP_USER      API runtime role: DML only on tables created by the migrator
#
# Credentials are passed as psql variables and quoted with :'var' / :"var", so they are never
# interpolated by the shell or concatenated into SQL.
set -euo pipefail

: "${DB_MIGRATOR_USER:?DB_MIGRATOR_USER is required}"
: "${DB_MIGRATOR_PASSWORD:?DB_MIGRATOR_PASSWORD is required}"
: "${DB_APP_USER:?DB_APP_USER is required}"
: "${DB_APP_PASSWORD:?DB_APP_PASSWORD is required}"

psql --no-psqlrc -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db="$POSTGRES_DB" \
  -v migrator="$DB_MIGRATOR_USER" -v migrator_pw="$DB_MIGRATOR_PASSWORD" \
  -v app="$DB_APP_USER" -v app_pw="$DB_APP_PASSWORD" <<'SQL'
CREATE ROLE :"migrator" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
  PASSWORD :'migrator_pw';
CREATE ROLE :"app" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
  PASSWORD :'app_pw';

-- Only explicitly granted roles may connect, and only to the application database.
-- (By default PUBLIC may connect to every database, including postgres and the templates.)
REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
REVOKE CONNECT ON DATABASE postgres, template1 FROM PUBLIC;
SELECT 'REVOKE CONNECT ON DATABASE template_postgis FROM PUBLIC'
  WHERE EXISTS (SELECT 1 FROM pg_database WHERE datname = 'template_postgis') \gexec
GRANT CONNECT, TEMPORARY ON DATABASE :"db" TO :"migrator";
GRANT CONNECT ON DATABASE :"db" TO :"app";

-- Only the migrator may create objects in the public schema.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO :"migrator";
GRANT USAGE ON SCHEMA public TO :"app";

-- Tables/sequences the migrator creates later are automatically usable (DML only) by the app.
ALTER DEFAULT PRIVILEGES FOR ROLE :"migrator" IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app";
ALTER DEFAULT PRIVILEGES FOR ROLE :"migrator" IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO :"app";

-- PostGIS requires superuser to install; the image's init script normally does this already.
CREATE EXTENSION IF NOT EXISTS postgis;

-- The image also installs postgis_topology, which we do not use. It adds a `topology` schema
-- to the database search_path, so remove both to keep the schema surface minimal.
DROP EXTENSION IF EXISTS postgis_topology;
DROP SCHEMA IF EXISTS topology;
ALTER DATABASE :"db" RESET search_path;
SQL

echo "20-roles.sh: created roles '$DB_MIGRATOR_USER' and '$DB_APP_USER'"
