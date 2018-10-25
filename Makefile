NODE_BIN = ./node_modules/.bin

.PHONY: build
build:
	env PROD=true ${NODE_BIN}/webpack

.PHONY: dev
dev:
	${NODE_BIN}/webpack --watch

.PHONY: analyze
analyze:
	env PROD=true BUNDLE_ANALYZER=true ${NODE_BIN}/webpack

.PHONY: setup
setup:
	yarn install

.PHONY: test
test: build
	-node test/import/node-require/index.js
	-${NODE_BIN}/tsc test/import/ts-star-import/index.ts
		-node test/import/ts-star-import/index.js
	-${NODE_BIN}/tsc test/import/ts-require/index.ts
		-node test/import/ts-require/index.js
	-node --experimental-modules test/import/node-star-experimental-modules/index.mjs

	-${NODE_BIN}/tsc test/import/ts-default-import/index.ts
		-node test/import/ts-default-import/index.js
	-node --experimental-modules test/import/node-default-experimental-modules/index.mjs

.PHONY: test-browser
test-browser: build
	open "http://localhost:8000/test/import/browser-star/"
	python -m SimpleHTTPServer

.PHONY: build-for-git
build-for-git: prod
	git stage -f build/*.js build/*d.ts

.PHONY: deploy
deploy:
	rsync -avz ./ garron.net:~/garron.net/code/clipboard-polyfill/ \
		--exclude .git \
		--exclude node_modules

.PHONY: publish
publish: deploy
	git push --tags origin
	git push origin master
	yarn publish
