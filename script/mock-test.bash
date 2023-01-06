#!/usr/bin/env bash

set -euo pipefail

npx esbuild \
  --format=esm --target=es2020 \
  --bundle --external:node:assert \
  --supported:top-level-await=true \
  --outfile=./dist/mock-test/modern-writeText.js \
  ./src/mock-test/modern-writeText.ts

node ./dist/mock-test/modern-writeText.js
