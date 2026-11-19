#!/bin/sh
# Regenerate hash-pinned lock files from pyproject.toml.
#
# Runs INSIDE the same Linux image as the production Dockerfile so platform-specific
# dependencies (e.g. uvloop) resolve for the deployment target, not the dev machine.
#
# Usage (from repository root):
#   docker run --rm -v "$PWD/apps/backend:/src" -w /src python:3.12-slim-bookworm sh scripts/lock.sh
set -eu

pip install --quiet --root-user-action=ignore "pip-tools>=7.4,<8"

pip-compile --quiet --generate-hashes --strip-extras --allow-unsafe \
  --output-file requirements.lock pyproject.toml

pip-compile --quiet --generate-hashes --strip-extras --allow-unsafe --extra dev \
  --output-file requirements-dev.lock pyproject.toml

echo "Wrote requirements.lock and requirements-dev.lock"
