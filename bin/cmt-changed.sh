#!/usr/bin/sh

git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"

git add README.md stars-list-shim.all.json
git status --porcelain | grep -E "^ *M" | grep stars-list-shim.all.json
if [ $? -eq 0 ]; then git commit -m "chore(core): update readme in github action" --date "$(date "+%Y-%m-%d %H:%M:%S" -d "+8 hour") +0800" ; fi

# bin/cmt-changed.sh