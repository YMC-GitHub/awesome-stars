#!/usr/bin/env node

import {readdirSync,statSync} from "fs"
import {exec,execOpts} from "../lib/run-bash.js"
import formatDate from "../lib/format-date.js";
const {log} = console


async function main(){
    let res 
    // await runcmd(`git config --local user.email "github-actions[bot]@users.noreply.github.com"`,execOpts)
    // await runcmd(`git config --local user.name "github-actions[bot]"`,execOpts)
    // await runcmd(`git add README.md stars-list-shim.all.json`,execOpts)
    //'D' vs ' M' vs '??'

    log(`[info] get modified files`)
    let files = await runcmd(`git status --porcelain | grep -E "^ *M" | sed "s/ M //g"`,execOpts)
    files=toArray(files)

    log(`[info] get time now`)
    let now = formatDate("yyyy-MM-dd HH:mm:ss",getTimeOfTimeZone(new Date(), "Asia/Shanghai"))
    // now = await exec(`date "+%Y-%m-%d %H:%M:%S" -d "+8 hour"`,execOpts)
    log(`[info] it is beijing time ${now}`)

    log(`[info] check targetfile changed`)
    let toCmtFiles=['README.md','stars-list-shim.all.json']
    if(files.some(v=>toCmtFiles.includes(v))){
        log(`[info] commit target files`)
        res = await runcmd(`git add ${toCmtFiles.join(" ")}`,execOpts)
        res = await runcmd(`git commit -m "chore(core): update readme in github action" --date "${now}"`,execOpts)
    }
    // git rm bin/cmt-changed.sh
    
}
async function runcmd(cmd,execOpts){
    let {stdout,stderr} = await exec(cmd,execOpts)
    return stdout
}
function toArray(s,options={}){
    let option={
        span:/\r?\n/,
        ...options
    }
    return Array.isArray(s)?s:typeof s =="string"?s.split(option.span):[s]
}
function getTimeOfTimeZone(date, timeZone) {
    let lang = "chinese";
    // lang = "en-US";
    if (typeof date === "string") {
        return new Date(
            new Date(date).toLocaleString(lang, {
                timeZone,
            })
        );
    }

    return new Date(
        date.toLocaleString(lang, {
            timeZone,
        })
    );
}

main()


//  bin/cmt-changed.js