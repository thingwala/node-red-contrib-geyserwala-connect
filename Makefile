setup:
	node -v
	npm -v
	mkdir -p _node_red && \
	cd _node_red && \
	npm init -y && \
	npm install node-red && \
	npm install mqtt

link:
	cd _node_red/node_modules && \
	ln -sf ../.. node-red-contrib-geyserwala-connect

unlink:
	rm -f _node_red/node_modules/node-red-contrib-geyserwala-connect

clean:
	rm -rf _node_red

run:
	cd _node_red && \
	npx node-red -u .

login:
	npm login

publish:
	npm publish --access public
