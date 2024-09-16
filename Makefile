install:
	npm ci

develop:
	rm -rf dist
	npx webpack serve

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint