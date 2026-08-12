#!/bin/sh

set -eu

GITHUB_TOKEN="${GITHUB_TOKEN:-${GH_PACKAGES_TOKEN:-}}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Missing package token. Set GH_PACKAGES_TOKEN or GITHUB_TOKEN." >&2
  exit 1
fi

export GITHUB_TOKEN
npm publish
