.PHONY: build-watch
build-watch:
	./node_modules/.bin/webpack --watch

.PHONY: prod
prod:
	env PROD=true ./node_modules/.bin/webpack

.PHONY: analyze
analyze:
	env PROD=true BUNDLE_ANALYZER=true ./node_modules/.bin/webpack --watch

.PHONY: setup
setup:
	git update-index --assume-unchanged build/clipboard.js
	yarn install

.PHONY: stage-build
stage-build:
	git update-index --no-assume-unchanged build/clipboard.js
	make prod
	git stage build/clipboard.js
	git update-index --assume-unchanged build/clipboard.js

.PHONY: deploy
deploy:
	rsync -avz ./ garron.net:~/garron.net/code/clipboard-polyfill/ \
		--exclude .git \
		--exclude node_modules
