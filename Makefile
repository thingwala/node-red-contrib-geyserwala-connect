setup:
	node -v
	npm -v
	mkdir -p .node-red && \
	cd .node-red && \
	npm init -y && \
	npm install node-red && \
	npm install mqtt

link:
	cd .node-red/node_modules && \
	ln -sf ../.. node-red-contrib-geyserwala-connect

unlink:
	rm -f .node-red/node_modules/node-red-contrib-geyserwala-connect

clean:
	rm -rf .node-red

run:
	cd .node-red && \
	npx node-red -u .

login:
	npm login

publish:
	npm publish --access public
