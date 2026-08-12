#!/bin/sh

set -eu

NODE_AUTH_TOKEN="${NODE_AUTH_TOKEN:-${GH_PACKAGES_TOKEN:-}}"

if [ -z "$NODE_AUTH_TOKEN" ]; then
  echo "Missing package token. Set GH_PACKAGES_TOKEN or NODE_AUTH_TOKEN." >&2
  exit 1
fi

export NODE_AUTH_TOKEN
npm publish
