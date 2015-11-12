all: clipboard.min.js

clipboard.min.js: clipboard.js
	closure-compiler \
		--js clipboard.js \
		--js_output_file clipboard.min.js

.PHONY: deploy
deploy:
	rsync -avz ./ garron.net:~/garron.net/code/clipboard.js/ --exclude .git
