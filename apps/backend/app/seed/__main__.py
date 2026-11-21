"""Seed reference regions: `python -m app.seed [--dry-run] [--file PATH]`.

Runs as the migrator role (an administrative operation, like migrations). In Docker:
    docker compose run --rm migrate python -m app.seed
"""

import argparse
import asyncio
import sys
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.seed.regions import DEFAULT_SEED_FILE, load_region_seed, seed_regions


async def _run(path: Path, dry_run: bool) -> int:
    data = load_region_seed(path)
    engine = create_async_engine(get_settings().migrator_database_url, poolclass=NullPool)
    try:
        async with AsyncSession(engine, expire_on_commit=False) as session:
            report = await seed_regions(session, data)
            if dry_run:
                await session.rollback()
            else:
                await session.commit()
    finally:
        await engine.dispose()

    mode = "DRY RUN (rolled back)" if dry_run else "committed"
    print(f"Region seed {mode}:")
    for outcome in ("created", "updated", "unchanged"):
        detail = ", ".join(f"{k}={v}" for k, v in getattr(report, outcome).items()) or "-"
        print(f"  {outcome:9} {report.total(outcome):4}  {detail}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Seed reference regions (idempotent).")
    parser.add_argument("--file", type=Path, default=DEFAULT_SEED_FILE)
    parser.add_argument("--dry-run", action="store_true", help="report changes, then roll back")
    args = parser.parse_args()
    return asyncio.run(_run(args.file, args.dry_run))


if __name__ == "__main__":
    sys.exit(main())
