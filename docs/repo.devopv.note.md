
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


# git push -u github main
```