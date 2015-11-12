all: clipboard.min.js

clipboard.min.js: clipboard.js
	closure-compiler \
		--js clipboard.js \
		--js_output_file clipboard.min.js