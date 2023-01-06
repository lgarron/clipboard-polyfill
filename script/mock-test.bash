#!/usr/bin/env bash

set -euo pipefail

function runMockText {
  BASENAME="${1}"
  npx esbuild \
    --format=esm --target=es2020 \
    --bundle --external:node:assert \
    --supported:top-level-await=true \
    --outfile="./dist/mock-test/${BASENAME}.js" \
    "./src/mock-test/${BASENAME}.ts"

  node "./dist/mock-test/${BASENAME}.js"
}

runMockText modern-writeText
runMockText missing-Promise
