
.PHONY: build
build: build-js build-types

.PHONY: build-js
build-js: setup
	bun run script/build.ts

.PHONY: build-types
build-types: setup
	bun x tsc --project tsconfig.json

.PHONY: setup
setup:
	bun install --frozen-lockfile

.PHONY: build-demo
build-demo: setup
	bun run script/build-demo.ts

.PHONY: test
test: build build-demo lint test-bun test-no-es6-browser-globals

.PHONY: mock-test
mock-test: setup
	./script/mock-test.bash

.PHONY: test-no-es6-browser-globals
test-no-es6-browser-globals: build-js
	bun run dist/es6/clipboard-polyfill.es6.js

.PHONY: test-bun
test-bun: setup
	bun script/test-bun.ts

.PHONY: dev
dev: setup
	bun run script/dev.ts

.PHONY: lint
lint: setup
	bun x @biomejs/biome check

.PHONY: format
format: setup
	bun x @biomejs/biome format --write

.PHONY: clean
clean:
	rm -rf ./dist

.PHONY: reset
reset: clean
	rm -rf ./node_modules

.PHONY: prepublishOnly
prepublishOnly: clean build

# This is here because `npm` has issues with a `script` field named `publish`.
.PHONY: publish
publish:
	npm publish

.PHONY: deploy
deploy: build-demo
	bun x @cubing/deploy
