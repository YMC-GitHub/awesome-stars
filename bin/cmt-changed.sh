#!/usr/bin/sh

git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"

git add README.md stars-list-shim.all.json
git status --porcelain | grep -E "^ *M"
if [ $? -eq 0 ]; then git commit -m "chore(core): update readme in github action" --date "$(date "+%Y-%m-%d %H:%M:%S" -d "+8 hour") +0800" ; fi

# add-exec-right:add
# chmod +x bin/cmt-changed.sh
# add-exec-right:check
# ls -l bin

#Changes to be committed:
#Untracked files:

# bin/cmt-changed.sh