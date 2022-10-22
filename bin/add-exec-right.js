#!/usr/bin/env node

import {readdirSync,statSync} from "fs"
import {exec,execOpts} from "../lib/run-bash.js"
const {log} = console
async function main(){
    let dir='bin'
    let list =readdirSync(dir).map(f=>{
        return `${dir}/${f}`
    }).filter(f=>statSync(f).isFile())

    let prs = list.map(async f=>{
        let cmd=`chmod +x ${f}`
        log(`[info] run: ${cmd}`)
        // await exec(`chmod +x ${f}`,execOpts)
        await exec(`git update-index --chmod=+x ${f}`,execOpts)
        
    })
    await Promise.all(prs)
    let res = await exec(`ls bin -l`,execOpts)
    log(res)
}
main()
// node bin/add-exec-right.js

//https://dev.to/ku6ryo/chmod-x-by-git-on-windows-5fjd
//https://m.imooc.com/wenda/detail/417375