"""Create a local/CI `.env` from `.env.example`, generating every secret.

Usage (from the repository root):
    python scripts/create-dev-env.py            # writes .env (refuses to overwrite)
    python scripts/create-dev-env.py --output path/to/.env --force

Every `*_PASSWORD=change-me` and an empty `JWT_SECRET_KEY=` get fresh random values. Secrets
are never printed. Not for production: production secrets belong in a secrets manager.
"""

import argparse
import re
import secrets
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PASSWORD_LINE = re.compile(r"^([A-Z0-9_]*PASSWORD)=change-me$", re.MULTILINE)
JWT_LINE = re.compile(r"^JWT_SECRET_KEY=$", re.MULTILINE)


def render(example: str) -> str:
    text = PASSWORD_LINE.sub(lambda m: f"{m.group(1)}={secrets.token_urlsafe(32)}", example)
    text = JWT_LINE.sub(lambda _: f"JWT_SECRET_KEY={secrets.token_urlsafe(64)}", text)
    if "change-me" in text:
        raise SystemExit("error: .env.example has an unhandled 'change-me' placeholder")
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--output", type=Path, default=ROOT / ".env")
    parser.add_argument("--force", action="store_true", help="overwrite an existing file")
    args = parser.parse_args()

    if args.output.exists() and not args.force:
        print(f"error: {args.output} exists; use --force to overwrite", file=sys.stderr)
        return 1
    text = render((ROOT / ".env.example").read_text(encoding="utf-8"))
    args.output.write_text(text, encoding="utf-8", newline="\n")
    generated = len(PASSWORD_LINE.findall((ROOT / ".env.example").read_text(encoding="utf-8")))
    print(f"wrote {args.output} ({generated} passwords and a JWT secret generated)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
