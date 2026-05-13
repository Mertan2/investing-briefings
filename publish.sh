#!/usr/bin/env bash
# Commit & push today's outputs to GitHub Pages.
# Invoked by the stock-analysis routine after it writes the day's files.

set -euo pipefail

cd "$(dirname "$0")"

git add briefings/ buy-targets/

if git diff --cached --quiet; then
  echo "publish.sh: nothing new to publish."
  exit 0
fi

git commit -m "Briefing $(date +%F)" --quiet
git push --quiet
echo "Published → https://mertan2.github.io/investing-briefings/"
