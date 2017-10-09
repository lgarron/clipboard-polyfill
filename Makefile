.PHONY: dev
dev:
	./node_modules/.bin/webpack --watch

.PHONY: prod
prod:
	env PROD=true ./node_modules/.bin/webpack

.PHONY: analyze
analyze:
	env PROD=true BUNDLE_ANALYZER=true ./node_modules/.bin/webpack --watch

.PHONY: setup
setup:
	git update-index --assume-unchanged build/clipboard-polyfill.js
	yarn install

.PHONY: build-for-git
build-for-git:
	git update-index --no-assume-unchanged build/clipboard-polyfill.js
	make prod
	git stage build/clipboard-polyfill.js
	git update-index --assume-unchanged build/clipboard-polyfill.js

.PHONY: deploy
deploy:
	rsync -avz ./ garron.net:~/garron.net/code/clipboard-polyfill/ \
		--exclude .git \
		--exclude node_modules
