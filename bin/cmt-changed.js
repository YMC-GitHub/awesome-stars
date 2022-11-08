#!/usr/bin/env node

import {readdirSync,statSync} from "fs"
import {exec,execOpts} from "../lib/run-bash.js"
import formatDate from "../lib/format-date.js";
const {log} = console


async function main(options={}){
    let res 
    log(`[info] set git user.name and user.email`)

    let robots = {
        email:"github-actions[bot]@users.noreply.github.com",
        name: "github-actions[bot]",
    }
    let author 
    author = {
        email:"ymc.github@gmail.com",
        name: "yemiancheng",
    }

    // author = {...robots,...author}
    let robotReg = [/\[bot\]/i]
    let msglabel = {
        human:'by human',
        robot:'in github action',
    }
    if(options.useRobots){
        author=robots
        msglabel = msglabel.robot
    }else{
        let currentAuthor = {
            email: await runcmd(`git config --local user.email`,execOpts),
            name: await runcmd(`git config --local user.name`,execOpts),
        }
        if(!isRobot(currentAuthor,robotReg)){
            author={...author,...currentAuthor}
        }
        msglabel = msglabel.human
    }
    log(author)
    log(isRobot(author,robotReg))

    // return
    await runcmd(`git config --local user.email "${author.email}"`,execOpts),
    await runcmd(`git config --local user.name "${author.name}"`,execOpts),
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

    log(`[info] check changed file`)
    let toCmtFiles=['README.md','stars-list-shim.all.json']
    if(isExpectedChangedFile({input:files,expectedChaned:toCmtFiles})){
        log(`[info] commit target files`)
        res = await runcmd(`git add ${toCmtFiles.join(" ")}`,execOpts)
        res = await runcmd(`git commit -m "chore(core): update readme ${msglabel}" --date "${now}"`,execOpts)
    }
    if(isExpectedChangedFile({input:files,expectedChanedReg:/^bin\/.*.js/ig})){
        log(`[info] commit target files`)
        res = await runcmd(`git add bin`,execOpts)
        res = await runcmd(`git commit -m "chore(core): update bin ${msglabel}" --date "${now}"`,execOpts)
        log(res)

        res = await runcmd(`git log --oneline -n 1"`,execOpts)
        log(res)
    }

    // git rm bin/cmt-changed.sh
    
}
function isExpectedChangedFile(options={}){
    let option = {
        input:[],
        expectedChaned:[],
        expectedChanedReg:undefined,
        ...options
    }
    let {input,expectedChaned,expectedChanedReg} = option
    // check reg if exsits
    if(expectedChanedReg){
        expectedChanedReg = Array.isArray(expectedChanedReg)?expectedChanedReg:[expectedChanedReg]
        if(input.some(v=>expectedChanedReg.some(reg=>reg.test(v)))){
            return true
        }
    }
    // check file if exsits
    if(expectedChaned){
        if(input.some(v=>expectedChaned.includes(v))){
            return true
        }
    }
    return false
}
function isRobot(author,robotReg){
    let {name,email} = author

    return inputMatchSome([name,email],robotReg)

}
function inputMatchSome(input,some){
    return input.some(v=>some.some(reg=>reg.test(v)))
}

async function runcmd(cmd,execOpts){
    let {stdout,stderr} = await exec(cmd,execOpts)
    if(stderr){
        log(stderr)
    }
    // if(stdout){
    //     log(stdout)
    // }
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

main({useRobots:false})


//  bin/cmt-changed.js