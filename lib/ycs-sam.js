import {ycs} from "./cli-help.js"
const {log}= console
ycs.param([
    {
        name: "-h,--help",
        type: "",
        value: "",
        desc: "info help",
    },
    {
        name: "-v,--version",
        type: "",
        value: "1.0.0",
        desc: "info version",
    },
])
    .usage()
    .option("ymc", "1.0.0")
    .entry({
        fn: (args) => {
            log(args);
        },
    })
    .run();
// log(ycs)
// log(ycs.getParamDefaultValue())

// node lib/ycs-sam.js
// node lib/ycs-sam.js --ci
// node lib/ycs-sam.js --des=packages/noop -c -u -w --name=.ymcrc.json -- a- -b -v