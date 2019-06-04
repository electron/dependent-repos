#!/usr/bin/env bash

set -v            # print commands before execution
set -o errexit    # always exit on error
set -o pipefail   # honor exit codes when piping
set -o nounset    # fail on unset variables

git clone "https://electron-bot:$GH_TOKEN@github.com/electron/dependent-repos" module

cd module
npm ci

npm run build

# bail if nothing changed
if [ "$(git status --porcelain)" = "" ]; then
  echo "No new content found: exiting!"
  exit
fi

git config user.email "electron@github.com"
git config user.name "electron-bot"
git add .
git commit -m "chore: update dependent-repos database"
git push origin master --follow-tags