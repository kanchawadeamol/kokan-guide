"""Write the API's OpenAPI schema as deterministic JSON.

Usage: python scripts/export_openapi.py <output-path>

Builds the app with isolated test settings (no `.env`, no database connection), so the output
depends only on the code, never on the developer's machine.
"""

import json
import sys
from pathlib import Path

from app.core.config import Environment, Settings
from app.main import create_app


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: export_openapi.py <output-path>", file=sys.stderr)
        return 2
    settings = Settings(_env_file=None, app_env=Environment.TEST)
    schema = create_app(settings).openapi()
    output = Path(argv[1])
    output.write_text(
        json.dumps(schema, indent=2, sort_keys=True, ensure_ascii=False) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
