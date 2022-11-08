#!/usr/bin/env node

import { readdirSync, statSync } from "fs";
import { exec, execOpts } from "../lib/run-bash.js";
import formatDate from "../lib/format-date.js";
import parseArgs from "../lib/parse-args.js";
import {
    getBuiltinConfig,
    getCliFlags,
    getObjOnlyDefinedKeys,
} from "../lib/cli-param.js";

const { log } = console;

function param() {
    return [
        {
            name: "-h,--help",
            type: "boolean",
            value: false,
            desc: "info help",
        },
        {
            name: "-v,--version",
            type: "string",
            value: "1.0.0",
            desc: "info version",
        },
        {
            name: "--use-robots",
            type: "boolean",
            value: false,
            desc: "",
        },
        {
            name: "--msg-head",
            type: "string",
            value: "",
            desc: "the head of msg , commit msg type scope and subject",
        },
        {
            name: "--debug",
            type: "boolean",
            value: false,
            desc: "debug cli option",
        },
        //chore(core): update bin
    ];
}
async function main(options = {}) {
    // let option;
    // feat: parse nano-parse result in main handle
    // desc-x-s: plan set new parse-option to main
    // option = {...getCliFlags(cliOptions)} //options
    // option = { ...getCliFlags(options) };
    // option = getObjOnlyDefinedKeys(option);
    // desc-x-e: plan set new parse-option to main

   let option = parseNanoParserResultInMain(options)

    let res;
    log(`[info] set git user.name and user.email`);

    let robots = {
        email: "github-actions[bot]@users.noreply.github.com",
        name: "github-actions[bot]",
    };
    let author;
    author = {
        email: "ymc.github@gmail.com",
        name: "yemiancheng",
    };

    // author = {...robots,...author}
    let robotReg = [/\[bot\]/i];
    let msglabel = {
        human: "by human",
        robot: "in github action",
    };
    if (option.useRobots) {
        author = robots;
        msglabel = msglabel.robot;
    } else {
        let currentAuthor = {
            email: await runcmd(`git config --local user.email`, execOpts),
            name: await runcmd(`git config --local user.name`, execOpts),
        };
        if (!isRobot(currentAuthor, robotReg)) {
            author = { ...author, ...currentAuthor };
        }
        msglabel = msglabel.human;
    }
    log(author);
    log(isRobot(author, robotReg));

    // return
    await runcmd(`git config --local user.email "${author.email}"`, execOpts),
        await runcmd(`git config --local user.name "${author.name}"`, execOpts),
        // await runcmd(`git config --local user.email "github-actions[bot]@users.noreply.github.com"`,execOpts)
        // await runcmd(`git config --local user.name "github-actions[bot]"`,execOpts)
        // await runcmd(`git add README.md stars-list-shim.all.json`,execOpts)
        //'D' vs ' M' vs '??'

        log(`[info] get modified files`);
    let files = await runcmd(
        `git status --porcelain | grep -E "^ *M" | sed "s/ M //g"`,
        execOpts
    );
    files = toArray(files);

    log(`[info] get time now`);
    let now = formatDate(
        "yyyy-MM-dd HH:mm:ss",
        getTimeOfTimeZone(new Date(), "Asia/Shanghai")
    );
    // now = await exec(`date "+%Y-%m-%d %H:%M:%S" -d "+8 hour"`,execOpts)
    log(`[info] it is beijing time ${now}`);

    log(`[info] check changed file`);
    let toCmtFiles = ["README.md", "stars-list-shim.all.json"];
    if (isExpectedChangedFile({ input: files, expectedChaned: toCmtFiles })) {
        log(`[info] commit target files`);
        res = await runcmd(`git add ${toCmtFiles.join(" ")}`, execOpts);
        res = await runcmd(
            `git commit -m "chore(core): update readme ${msglabel}" --date "${now}"`,
            execOpts
        );
    }
    if (
        isExpectedChangedFile({
            input: files,
            expectedChanedReg: /^bin\/.*.js/gi,
        })
    ) {
        log(`[info] commit target files`);
        res = await runcmd(`git add bin`, execOpts);
        res = await runcmd(
            `git commit -m "chore(core): update bin ${msglabel}" --date "${now}"`,
            execOpts
        );
        log(`[info] info commit output`);
        log(res);
        res = await runcmd(`git log --oneline -n 1"`, execOpts);
        log(res);
    }

    // git rm bin/cmt-changed.sh
}
function isExpectedChangedFile(options = {}) {
    let option = {
        input: [],
        expectedChaned: [],
        expectedChanedReg: undefined,
        ...options,
    };
    let { input, expectedChaned, expectedChanedReg } = option;
    // check reg if exsits
    if (expectedChanedReg) {
        expectedChanedReg = Array.isArray(expectedChanedReg)
            ? expectedChanedReg
            : [expectedChanedReg];
        if (input.some((v) => expectedChanedReg.some((reg) => reg.test(v)))) {
            return true;
        }
    }
    // check file if exsits
    if (expectedChaned) {
        if (input.some((v) => expectedChaned.includes(v))) {
            return true;
        }
    }
    return false;
}
function isRobot(author, robotReg) {
    let { name, email } = author;

    return inputMatchSome([name, email], robotReg);
}
function inputMatchSome(input, some) {
    return input.some((v) => some.some((reg) => reg.test(v)));
}

async function runcmd(cmd, execOpts) {
    let { stdout, stderr } = await exec(cmd, execOpts);
    if (stderr) {
        log(stderr);
    }
    // if(stdout){
    //     log(stdout)
    // }
    return stdout;
}
function toArray(s, options = {}) {
    let option = {
        span: /\r?\n/,
        ...options,
    };
    return Array.isArray(s)
        ? s
        : typeof s == "string"
        ? s.split(option.span)
        : [s];
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



//--------why: parseNanoParserResult-------------
// keep lib-ernty and cli-entry to the same code
// code anywhere , run anyway
//--------why: parseNanoParserResult-------------
/**
 * 
 * @param {*} options 
 * @returns 
 * @sample
 * ```
 * let option = parseNanoParserResultInMain(options)
 * ```
 */
function parseNanoParserResultInMain(options){
    let option;
    // feat: parse nano-parse result in main handle
    // desc-x-s: plan set new parse-option to main
    // option = {...getCliFlags(cliOptions)} //options
    option = { ...getCliFlags(options) };
    option = getObjOnlyDefinedKeys(option);
    // desc-x-e: plan set new parse-option to main
    return option
}

/**
 * 
 * @param {*} options 
 * @param {*} param 
 * @returns 
 * @sample
 * ```
 * let option = parseNanoParserResultInEntry(cliOptions,param)
 * ```
 */
function parseNanoParserResultInEntry(options,param){
    // feat: parse nano-parse result in entry handle
    // desc-x-s: extract parse-option from main
    let option = { ...getBuiltinConfig(param), ...getCliFlags(options) };
    option = getObjOnlyDefinedKeys(option);
    options.flags = option;
    option = { ...options };
    // desc-x-e: extract parse-option from main
    return option
}


function getCmdMod(mod) {
    let res = ''
    switch (mod) {
        case 'untracked':
        case 'u':
            res = 'untracked'
            break
        case 'tracked':
        case 't':
            res = 'tracked'
            break
        case 'modified':
        case 'm':
            res = 'modified'
            break
        case 'all':
            res = 'all'
        case 'a':
            break
        case 'other':
        case 'o':
        default:
            res = 'toadd'
            break
    }
    return res
}

/**
 * get pkg loc
 * @param {{packageslocReg:regexp}} options
 * @returns {{all:string[],untracked:string[],tracked:string[],modified:string[]}}
 * @sample
 * ```
 * await getPkgLoc({packagesLoc:["packages/"],packageslocReg: /^packages\//})
 * ```
 */
 async function getVcFileLoc(options = {}) {
    let option = {
        ...options
    }
    // all = getPkgLocInDiretory(option)
    let files = await runcmd(`git status --porcelain`, execOpts)
    files = await getVcFilesCatery({ ...option, files })
    return files
}
/**
 * get pkg loc of version control (vc) - mono repo
 * @param {{packageslocReg:regexp,packagesLoc:string|string[]}} options
 * @returns {{all:string[],untracked:string[],tracked:string[],modified:string[]}}
 */
 async function getVcFilesCatery(options = {}) {
    let all, untracked, modified, tracked

    let option = {
        ...options
    }
    let { files } = option

    // all = getPkgLocInDiretory(option)
    let regs = [/^\?\? ?/, /^ ?M ?/]
    all =files.split(/\r?\n/).map(v=>{
        for (let index = 0; index < regs.length; index++) {
            const reg = regs[index];
            if(reg.test(v)){
                v=v.replace(reg,'')
            break
            }
        }
        return v
    })

    // let files = await runcmd(`git status --porcelain`, execOpts)

    // get untracked
    untracked = await getVcPkgNameInLoc({
        lable: /^\?\? ?/,
        files,
        packageslocReg: /^/,
        for: 'file-loc'
    })
    // untracked = untracked.map(f => `${packagesLoc}/${f}`)

    // get tracked
    tracked = all.filter(v => !untracked.some(u => u === v))

    // get modified
    modified = await getVcPkgNameInLoc({
        lable: /^ ?M ?/,
        files,
        packageslocReg: /^/,
        for: 'file-loc'
    })
    // modified = modified.map(f => `${packagesLoc}/${f}`)
    return { all, untracked, tracked, modified }
}

/**
 * get pkg name of version control (vc) - mono repo
 * @param {{lable:regexp,packageslocReg:regexp,delLabel:boolean,pathSplit:string}} options
 * @returns {string[]}
 */
 async function getVcPkgNameInLoc(options = {}) {
    let option = {
        lable: /^\?\? ?/,
        EOFReg: /\r?\n/,
        pathSplit: '/',
        packageslocReg: /^packages\//,
        delLabel: true,
        files: '',
        for: 'pkg-name',
        ...options
    }

    let { files } = option
    //git status --porcelain | grep '^??' | cut -c4-| grep "packages/"
    // out = await rungit(`git status --porcelain | grep '^??' | cut -c4-| grep "packages/"`, execOpts)//ok
    // get all
    // files = await runcmd(`git status --porcelain`, execOpts)
    if (!files) return []
    // if (!files) files = await runcmd(`git status --porcelain`, execOpts)

    // get with prefix
    files = files.split(option.EOFReg).filter(v => {
        return option.lable.test(v)
    })

    // log(untracked)
    // del prefix
    if (option.delLabel) {
        files = files.map(v => {
            v = v.replace(option.lable, '')
            return v
        })
    }

    // log(untracked)

    // only in package loc
    files = files.filter(v => {
        return option.packageslocReg.test(v)
    })

    let sep = option.pathSplit
    // get name or loc
    // eg. file=packages/noop/xx ; name=noop;loc=packages/noop;
    switch (option.for.toLowerCase()) {
        case 'file-loc':
           
            break
        case 'pkg-loc':
            files = files.map(v => v.split(sep).slice(0, 2).join(sep)).filter(v => v)
            break
        case 'pkg-name':
        default:
            files = files.map(v => v.split(sep)[1]).filter(v => v)
            break
    }

    // del dup
    files = [...new Set(files)]
    return files
}

async function entry(input) {
    let cliOptions = parseArgs(input);
    // slice _ for sciptt
    if(cliOptions._ && cliOptions._.length>0){
        cliOptions._ = cliOptions._.slice(2)
    }


    // desc-x-s: extract parse-option from main
    // let option = { ...getBuiltinConfig(param()), ...getCliFlags(cliOptions) };
    // option = getObjOnlyDefinedKeys(option);
    // cliOptions.flags = option;
    // option = { ...cliOptions };
    // desc-x-e: extract parse-option from main
    let option = parseNanoParserResultInEntry(cliOptions,param)
    let files = await getVcFileLoc()
    log(files)

    // debug ycs cli option - debug NanoParserResult
    if (option.debug || option.flags.debug) {
        log(option);
        // process.exit(0)
        return;
    }
    main(option);
}
entry(process.argv);

//  bin/cmt-changed.js
//  bin/cmt-changed.js --use-robots
//  bin/cmt-changed.js --msg-head="chore(core): add lib"
//  bin/cmt-changed.js --msg-head="chore(core): add lib cli-param"
//  bin/cmt-changed.js --msg-head="chore(core): add lib cli-param" --debug

//  bin/cmt-changed.js o:add --debug
//  bin/cmt-changed.js o:pkg --debug
//  bin/cmt-changed.js o:lin --debug