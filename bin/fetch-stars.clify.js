#!/usr/bin/env node

import { ycs } from "../lib/cli-help.js";
import main from "./fetch-stars.js";
const { log } = console;
ycs.param([
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
        name: "--token",
        type: "string",
        value: "",
        desc: "the github token",
    },
    {
        name: "--token-file-loc",
        type: "string",
        value: "secrets/token-for-dev.txt",
        desc: "the github token file loc",
    },
    {
        name: "-s,--start-page",
        type: "number",
        value: 1,
        desc: "the start index of page",
    },
    {
        name: "-d,--last-page",
        type: "number",
        value: 1,
        desc: "the last index of page",
    },
    {
        name: "--sort",
        type: "string",
        value: "updated",
        desc: "the query how pages sort",
    },
    {
        name: "--data-file-loc",
        type: "string",
        value: "tmp/stars-list-shim.all.json",
        desc: "the stars list file loc",
    },
    {
        name: "--dbg-info-fetch-option",
        type: "boolean",
        value: false,
        desc: "info option of fectDataByPage when debug",
    },
]);

// let builtInConfig = ycs.getBuiltinFlags();
// // builtInConfig=ycs.getBuiltinFlags({slim:true,mode:"string"})
// log(builtInConfig);


ycs.usage()
    .option("ymc", "1.0.0")
    .entry({
        // enableZeroOption:true, //todo: rename to enableZeroCmd ?
        // notOnlyFlags:true,
        fn: (args) => {
            // log(ycs.ycs)
            // get all args (flag,_,extras)
            // log(args);

            // let builtInFlags = ycs.getBuiltinFlags();
            // log(builtInFlags);
            // let cliFlag = ycs.getCliFlags(args)
            // log(cliFlag);
            // log(`[info] get current flags`);
            let nowFlag = ycs.getCurrentFlags(args)
            // log(nowFlag);
            main(nowFlag)
            // log(ycs.getBuiltinFlags({slim:true,mode:"string",modeStyle:"swithoption"}))
        },
    })
    .run();
// log(ycs)

// node bin/fetch-stars.clify.js
// node bin/fetch-stars.clify.js --ci
// node bin/fetch-stars.clify.js --des=packages/noop -c -u -w --name=.ymcrc.json -- a- -b -v
// node bin/fetch-stars.clify.js --des=packages/noop -c -u -w --name=.ymcrc.json -- a- -b -v
// node bin/fetch-stars.clify.js add --help=false --startPage=1 --lastPage=10 --sort=updated
// node bin/fetch-stars.clify.js --help=false --startPage=1 --lastPage=10 --sort=updated --dbg-info-fetch-option
// --dry-run=true
// node bin/fetch-stars.clify.js --help=false --startPage=1 --lastPage=1 --sort=updated --dbg-info-fetch-option
// node bin/fetch-stars.clify.js --data-file-loc=stars-list-shim.all.json --startPage=1 --lastPage=1 --sort=updated --dbg-info-fetch-option
// node bin/fetch-stars.clify.js --data-file-loc=stars-list-shim.all.json --startPage=1 --lastPage=1 --sort=updated --token=$env.GH_TOKEN # in github action