#!/bin/bash
set -e

./node_modules/.bin/webpack-serve \
  --config ./example/webpack.config.js \
  --port 8080 \
  --log-level error \
  --no-clipboard \
  &
