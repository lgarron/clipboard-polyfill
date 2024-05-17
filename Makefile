
.PHONY: build
build:
		node script/build.js
		npx tsc --project tsconfig.json

.PHONY: build-demo
build-demo:
		node script/build-demo.js

.PHONY: test
test: build build-demo lint test-bun test-no-es6-browser-globals

.PHONY: mock-test
mock-test:
		./script/mock-test.bash

.PHONY: test-no-es6-browser-globals
test-no-es6-browser-globals:
		node dist/es6/clipboard-polyfill.es6.js

.PHONY: test-bun
test-bun:
		bun script/test-bun.ts

.PHONY: dev
dev:
		node script/dev.js

.PHONY: lint
lint:
		npx @biomejs/biome check ./script ./src

.PHONY: format
format:
		npx @biomejs/biome format --write ./script ./src

.PHONY: clean
clean:
		rm -rf ./dist

.PHONY: prepack
prepack:
		npm run clean && npm run build


# This is here because `npm` has issues with a `script` field named `publish`.
.PHONY: publish
publish:
	npm publish

.PHONY: deploy
deploy: build-demo
	rsync -avz ./dist/demo/ garron.net:~/garron.net/code/clipboard-polyfill/ \
		--exclude .git \
		--exclude node_modules \
		--exclude .rpt2_cache
