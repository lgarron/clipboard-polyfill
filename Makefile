# Note: the first command becomes the default `make` target.
NPM_COMMANDS = build dev test lint setup clean

.PHONY: $(NPM_COMMANDS)
$(NPM_COMMANDS):
	npm run $@

# This is here because `npm` has issues with a `script` field named `publish`.
.PHONY: publish
publish:
	npm publish

.PHONY: deploy
deploy:
	rsync -avz ./ garron.net:~/garron.net/code/clipboard-polyfill/ \
		--exclude .git \
		--exclude node_modules \
		--exclude .rpt2_cache
