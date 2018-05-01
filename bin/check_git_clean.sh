#!/bin/bash
set -e

# ignore any changes to the package- and lock files (cross platform installs)
git checkout package.json package-lock.json

# make sure there are no other changes, e.g. in dist folder or otherwise
git status
git --no-pager diff
(if [ -n "$(git status --porcelain)" ]; then exit 1; else exit 0; fi)
