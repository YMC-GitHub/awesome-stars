
```bash
# add github repo
node scr/9.add-github-repo.js ymc-github/awesome-stars ;

# ini repo basic files
mkdir -p ../awesome-stars ; cp tmp/{readme.md,stars*} ../awesome-stars;

# set base style config
cp .editorconfig ../awesome-stars;

# set github workflow
mkdir -p ../awesome-stars/.github/workflows ;
cp ../ymc-github-profile/.github/workflows/ymc-github.gen-readme.yaml ../awesome-stars/.github/workflows/auto-update.yaml

cp ../ymc-github-profile/{package.json,pnpm*} ../awesome-stars ;
cp ../ymc-github-profile/.gitignore ../awesome-stars ;


# in its project dir
# cd ../awesome-stars;
git init ;git branch -M main ; git remote add github git@github.com:YMC-GitHub/awesome-stars.git ;

# git config --global init.defaultBranch main ;
# git init ; git remote add github git@github.com:YMC-GitHub/awesome-stars.git ;

# code in vscode
# code  ../awesome-stars;

# add basic repo files
git add .gitignore ; git commit -m "chore(core): ini ignore files"; git log --oneline -n 1
git add .editorconfig ; git commit -m "chore(core): ini style files"; git log --oneline -n 1

git add pnpm-lock.yaml package.json; git commit -m "chore(core): ini npm pkg"; git log --oneline -n 1

git add .github/workflows*; git commit -m "chore(core): ini github action"; git log --oneline -n 1

# add data files
git add stars*.json ; git commit -m "chore(core): add data files"; git log --oneline -n 1

git add README.md; git commit -m "docs(core): ini readme"; git log --oneline -n 1


git add docs/repo.devopv*; git commit -m "docs(core): add devopv note"; git log --oneline -n 1
git add docs/repo.devopv*; git commit -m "docs(core): update devopv note"; git log --oneline -n 1


# git push -u github main

chmod +x bin/render-readme.js
git update-index --chmod=+x bin/render-readme.js
git update-index --chmod=+x bin/cmt-changed.sh
git add bin/render-readme.js template/readme.head.md ; git commit -m "chore(core): add bin script"; git log --oneline -n 1
git add bin/render-readme.js ; git commit -m "chore(core): add exec right"; git log --oneline -n 1
git add bin/render-readme.js ; git commit -m "chore(core): add markdown list style"; git log --oneline -n 1
git add bin/render-readme.js ; git commit -m "chore(core): add table of content"; git log --oneline -n 1

git add README.md; git commit -m "docs(core): update readme"; git log --oneline -n 1
git add README.md; git commit -m "docs(core): update colorful line link"; git log --oneline -n 1
git add README.md; git commit -m "docs(core): add table of content"; git log --oneline -n 1
git add docs/repo.feat*; git commit -m "docs(core): add readme feat"; git log --oneline -n 1
git add README.md; git commit -m "docs(core): use markdown list style"; git log --oneline -n 1
git add template/readme.head.md ; git commit -m "chore(core): update colorful line link"; git log --oneline -n 1

git pull github main --rebase && git push github main

git rebase -i --root
rm -r *shim.*

git add bin lib ; git commit -m "chore(core): update script"; git log --oneline -n 1
git add bin lib ; git commit -m "chore(core): set unkown languages"; git log --oneline -n 1

git add *shim.* ; git commit -m "chore(core): update data files"; git log --oneline -n 1
git rm stars-list-shim.json stars-list.json ; git commit -m "chore(core): delete unused files"; git log --oneline -n 1
git add README.md; git commit --file .git/COMMIT_EDITMSG; git log --oneline -n 1
git add  README.md ; git commit -m "docs(core): set unkown languages"; git log --oneline -n 1
git restore README.md

git add  secrets/.gitignore ; git commit -m "chore(core): ignore secrets dir"; git log --oneline -n 1
git add lib bin/download.js bin/fetch-stars.clify.js

# add-bin: add exec right 
git add bin/add-exec-right.js lib/run-bash.js ; git commit -m "chore(core): add bin to add exec right"; git log --oneline -n 1
bin/add-exec-right.js

# add-bin: add bin to download file
git add lib/download-file.js lib/common-type.js bin/download.js; git commit -m "chore(core): add bin to download file"; git log --oneline -n 1

# add-bin: add bin fetch stars
git add bin/fetch-stars* lib; git commit -m "chore(core): add bin to fetch stars"; git log --oneline -n 1
git add bin/fetch-stars.clify.js lib; git commit -m "chore(core): add exec right"; git log --oneline -n 1


git add .github/workflows/auto-update.yaml ; git commit -m "chore(core): run action when push"; git log --oneline -n 1
# ls -l bin
bin/add-exec-right.js

chmod +x -R bin

chmod +x bin/add-exec-right.js
ls bin -l
git update-index --chmod=+x bin/add-exec-right.js


git diff --name-only -- ".js"
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep ".js") ; git add $changed ; git commit -m "chore(core): run without prefix node"; git log --oneline -n 1

changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): dbg bin"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): update node to 16.x"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): run bin without prefix node"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): dbg fetch stars"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): use github repo secret"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): dbg env in github action "; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): auto update"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): only push when updated"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep "workflows") ; git add $changed ; git commit -m "chore(core): fix permission denied "; git log --oneline -n 1

changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "bin|workflows") ; git add $changed ; git commit -m "chore(core): fix permission denied "; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): disable run on push"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): disable run on schedule"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): ebable run on push"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): enable run on schedule every 15 day at 8:08"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): fix run on schedule every 15 day at 8:08"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): put schedule to every 7 day at 8:08"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): add note"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): set github action env val"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): fix exit 1"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): set update time"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows|lib|temp") ; git add $changed ; git commit -m "chore(core): set update time"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows|lib|temp") ; git add $changed ; git commit -m "chore(core): put schedule to every day at 8:08"; git log --oneline -n 1
changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E ".vscode") ; git add $changed ; git commit -m "chore(core): disable auto-save yaml"; git log --oneline -n 1

bin/cmt-changed.js --msg-head="chore(core): dbg gh action"
bin/cmt-changed.js --msg-head="chore(core): set fetch-data enable"
bin/cmt-changed.js --msg-head="chore(core): set update time"
bin/cmt-changed.js --msg-head="chore(core): dbg os timezone"

git add .vscode/settings.json ; git commit --file .changeset/msg.tmp.md ; git log --oneline -n 1
git add .vscode/settings.json ;git commit -m "chore(core): del git bash terminal setting"; git log --oneline -n 1

git add jsconfig.json ;git commit -m "chore(core): set ymc alias"; git log --oneline -n 1


changed=$(git status --porcelain | grep -E "^ M" | sed "s/ M //g" |grep -E "workflows") ; git add $changed ; git commit -m "chore(core): disable run on push"; git log --oneline -n 1
# changed=$(git status --porcelain | grep -E "\?\?" | sed "s/?? //g" |grep -E "docs") ; git add $changed ; git commit -m "docs(core): add chord issue draft"; git log --oneline -n 1

401 Unauthorized
[warn] need github token
```

```
const code = response.statusCode ?? 0;                                     
SyntaxError: Unexpected token '?'

https://docs.github.com/en/actions/learn-github-actions/contexts#secrets-context
https://docs.github.com/cn/actions/learn-github-actions/environment-variables
[github-action-sam: write github action in docker](http://www.ty2y.com/study/bxzjdgithubactiontyzdhbs.html)
[github-action-sam: write github action with js](https://github.com/szenius/set-timezone/blob/master/index.js)
[github-action-sam: export access secrets.xx to env var](https://www.jianshu.com/p/adf755f2ebf9)

[auto record wake time]https://www.zhihu.com/question/472267975
https://chenzaichun.github.io/post/2021-09-21-github-action-trigger-by-curl-tasker/
https://github.com/chenzaichun/chenzaichun.github.io
[github workflow -  with vs env ]

https://github.com/dlavrenuek/test-workflow-if-condition/blob/master/.github/workflows/test.yml
[gh a: corn per 6 day](https://github.com/liununu/liununu/blob/master/.github/workflows/main.yml)

# Changes to be committed: vs Changes not staged for commit: vs Untracked files: vs Your branch is ahead of
```

### set  schedule

set github workflow schedule with beijing time +8 h

```yaml
  schedule:
    # - cron: 30 * * * * # run per 30 min
    # - cron: 0 8,12 * * * # run when 8:00 and 12:00 (utc)
    # - cron: 0 4 * * * # run when 12:00 (beijing)
    # - cron: 0 8 * * * # run when 0:00 (beijing)
    # - cron: 0 0,4 * * * # run when 8:00 and 12:00 (beijing)
    # - cron: 0 0,12 * * * # run when 8:00 and 20:00 (beijing)
    # - cron: 0 0,4,12 * * * # run when 8:00,12:00,20:00 (beijing)
    # - cron: 0 20 * * 0-5 #  runs at minute 0 of the 4th beijing hour from week 0 to 5
    # - cron: 8 17,20 * * 1,3,5 #  runs at minute 8 of the 1th,20th beijing hour from week 1 ,week 3 , week 5
    # - cron: 20/15 * * * * # runs every 15 minutes starting from minute 20 through 59 (minutes 20, 35, and 50)
    # - cron: 8 0 8 * * # runs at 8:08 the 8th day of per month
    # - cron: 8 0 25 * * # runs at 8:08 the 25th day of per month
    - cron: 8 0 1/7 * * # runs every 7 day at 8:08 starting from the day?
    - cron: 8 0 * * * # runs every day at 8:08 starting from the day?
```

value|description
:----|:----
30 * * * * | run per 30 min
0 8,12 * * * | run when 8:00 and 12:00 (utc)
0 4 * * * | run when 12:00 (beijing)
0 8 * * * | run when 0:00 (beijing)
0 0,4 * * * | run when 8:00 and 12:00 (beijing)
0 0,12 * * * | run when 8:00 and 20:00 (beijing)
0 0,4,12 * * * | run when 8:00,12:00,20:00 (beijing)
0 20 * * 0-5 |  runs at minute 0 of the 4th beijing hour from week 0 to 5
8 17,20 * * 1,3,5 |  runs at minute 8 of the 1th,20th beijing hour from week 1 ,week 3 , week 5
20/15 * * * * | runs every 15 minutes starting from minute 20 through 59 (minutes 20, 35, and 50)
8 0 8 * * | runs at 8:08 the 8th day of per month
8 0 25 * * | runs at 8:08 the 25th day of per month
8 0 1/7 * * | runs every 7 day at 8:08 starting from the day?
8 0 * * * | runs every day at 8:08 starting from the day?