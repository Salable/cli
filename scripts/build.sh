#!/bin/sh

npx tailwindcss -i ./src/styles/index.css -o ./src/styles/compiled.css
rollup -c
node ./scripts/build-styles-migrator.mjs
rm -rf ./src/styles/compiled.css