#!/usr/bin/env python3
"""Apply unified page-light shell to inner HTML pages."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SNIPPETS = Path(__file__).resolve().parent / "snippets"

FONT_OLD = re.compile(
    r'<link href="https://fonts\.googleapis\.com/css2\?family=Chivo\+Mono[^"]*" rel="stylesheet">\s*'
    r'<link href="https://api\.fontshare\.com/v2/css\?f\[\]=switzer[^"]*" rel="stylesheet">',
    re.MULTILINE,
)

FONT_NEW = """<link href="https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet">"""

CSS_LINK = '<link rel="stylesheet" href="/assets/site.css">'
CSS_WITH_INNER = (
    '<link rel="stylesheet" href="/assets/site.css">\n'
    '  <link rel="stylesheet" href="/assets/page-inner.css">'
)

INNER_PAGES = [
    "services/index.html",
    "get-started/index.html",
    "about/index.html",
    "events/index.html",
    "automation/index.html",
    "enablement/index.html",
    "engineering/index.html",
    "contact/index.html",
    "privacy/index.html",
]

HEADER = (SNIPPETS / "shell-header.html").read_text().strip()
FOOTER = (SNIPPETS / "shell-footer.html").read_text().strip()

NAV_PATTERN = re.compile(
    r"<nav class=\"nav\">.*?</nav>\s*",
    re.DOTALL,
)

FOOTER_PATTERN = re.compile(
    r"<section class=\"site-section site-section--tight\">.*?</section>\s*(?=</main>)",
    re.DOTALL,
)


def migrate(path: Path) -> None:
    text = path.read_text()

    text = text.replace('class="page-ivory"', 'class="page-light page-inner"')
    text = FONT_OLD.sub(FONT_NEW, text)
    text = text.replace(CSS_LINK, CSS_WITH_INNER)

    if NAV_PATTERN.search(text):
        text = NAV_PATTERN.sub(HEADER + "\n\n    ", text, count=1)
    else:
        print(f"  skip nav: {path}")

    if FOOTER_PATTERN.search(text):
        text = FOOTER_PATTERN.sub(FOOTER + "\n\n      ", text, count=1)
    else:
        print(f"  skip footer: {path}")

    path.write_text(text)
    print(f"migrated {path}")


def main() -> None:
    for rel in INNER_PAGES:
        migrate(ROOT / rel)


if __name__ == "__main__":
    main()