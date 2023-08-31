setup:
	node -v
	npm -v
	npm install -g --unsafe-perm node-red
	npm link

dev:
	mkdir -p .node-red
	cd .node-red
	npm install mqtt
	npm link node-red-contrib-geyserwala-connect

run:
	cd .node-red
	npm link
	mkdir -p .config
	node-red --userDir .config