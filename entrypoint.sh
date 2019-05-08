#!/usr/bin/env bash

set -x            # print commands before execution
set -o errexit    # always exit on error
set -o pipefail   # honor exit codes when piping
set -o nounset    # fail on unset variables

npm run build

[[ `git status --porcelain` ]] || exit

git add .
git config user.email "electron@github.com"
git config user.name "Electron Bot"
git commit -am "chore: update dependent-repos database"

git push origin master --follow-tags

curl $SNITCH_URL