setup:
	node -v
	npm -v
	mkdir -p .node-red && \
	cd .node-red && \
	npm init -y && \
	npm install node-red && \
	npm install mqtt && \
	cd  node_modules && \
	ln -sf ../.. node-red-contrib-geyserwala-connect

dev:
	cd .node-red && \
	npx node-red

login:
	npm login

publish:
	npm publish
