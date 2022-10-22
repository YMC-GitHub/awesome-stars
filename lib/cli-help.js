import argsParser from "./parse-args.js";

// parseArgs()
// defineOption()
// defineHelp()
// helpmsg -> clioption

// def-option -> use-option -> to-string -> get-option-val

const { log } = console;
const camelize = (str) =>
    str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "");

const getOptName = (s = "", t = "l") => {
    // idea: get l or loc as name
    // get -l,--loc
    // get l or loc
    let keys = "";
    keys = s
        .split(" ")[0]
        .split(",")
        .map((v) => v.replace(/^\-*/gi, ""));

    switch (t.toLowerCase()) {
        case "s":
            keys = keys[0];
            break;
        case "l":
            // feat: if not l , use s
            if (!keys[1]) {
                keys = keys[0];
            } else {
                keys = keys[1];
            }
            break;
    }
    return keys;
};

const getMapPathValue = (map, ns, def = {}) => {
    map[ns] = map[ns] ? map[ns] : def;
    return map[ns];
};

const getMap = (optionMap, ns = "", cmd = "") => {
    let map = optionMap;
    if (ns && cmd) {
        map = getMapPathValue(map, ns);
        map = getMapPathValue(map, cmd);
        // optionMap[ns]=optionMap[ns]?optionMap[ns]:{}
        // optionMap=[ns]
        // optionMap[cmd]=optionMap[cmd]?optionMap[cmd]:{}
        // optionMap=[cmd]
    } else if (ns) {
        map = getMapPathValue(map, ns);
    } else if (cmd) {
        map = getMapPathValue(map, cmd);
    }
    return map;
};
const getFormatOptStr = (opts, s = "", num = 2) => {
    opts = Array.isArray(opts) ? opts : [opts];
    return opts.join("\n").replace(/^/gim, Array(num).fill(s).join(""));
};

// idea:easier,faster to write ycs-cli usage when you clify your lib to ycs-cli
// add or get option
// bind option to ns or cmd
// make usage text with option
//
// bo.addOpt().getOpt().bind(cmd)
// bo.addOpt().getOpt().bind(ns)
// bo.addOpt().getOpt().bind(subns,subcmd)
// bo is short for bind-option
/**
 * @description
 * ```
 * ## why use?
 * - [x] write cli option in node.js
 * - [x] when many options is the same in subcmd or other cmd
 * ```
 * @sample
 * ```
 * //bo is short for bind-option
 * const bo = new CliOptionHelp();
 * //define option
 * bo.addOpt(`-l,--loc the des file location`);
 * bo.addOpt(`-h,--help get help`);
 * bo.addOpt(`-v,--version get version`);
 *
 * // feat:bind option to another subns,subcmd
 * bo.getOpt("loc").bindOpt("eslint", "add");
 *
 * // logMap()
 * // log(getMap(bo.optionMap))
 * // feat:option to usage
 * log(bo.usage());
 * // log(bo.usage('eslint','add'))
 * ```
 */
class CliOptionHelp {
    constructor() {
        this.optionMap = {};
        this.opt = "";
        this.relationMap = {};
        this.cmd = new Set();
        this.ns = new Set();
        this.paramMap = {};
    }

    // get(name,ns='',cmd=''){
    //   this.opt=getOpt(name,ns,cmd)
    //   return this
    // }
    addOpt(s = "", ns = "", cmd = "") {
        const { optionMap, relationMap } = this;
        const name = getOptName(s);

        // log(`add option ${name}`)
        let map = optionMap;
        map[name] = s;

        // log(`add relation ${name}`)
        map = getMap(relationMap, ns, cmd);
        map[name] = true;

        // log(`label ns and cmd`)
        this.cmd.add(cmd);
        this.ns.add(ns);
        return this;
    }

    getOpt(name, ns = "", cmd = "") {
        const { optionMap, relationMap } = this;
        const map = optionMap;
        this.opt = map[name];
        // map = getMap(optionMap,ns,cmd)
        return this;
    }

    logOpt() {
        log(this.opt);
        return this;
    }

    bindOpt(ns = "", cmd = "") {
        // log(`bind option to ns or cmd`)
        this.addOpt(this.opt, ns, cmd);
        return this;
    }

    usage(ns = "", cmd = "") {
        const { optionMap, relationMap } = this;
        let map;
        // log(`get relation`)
        map = getMap(relationMap, ns, cmd);

        // log(`get option name`)

        let optNameList;
        optNameList = Object.keys(map);
        // feat: filter cmd
        optNameList = optNameList.filter((name) => !this.cmd.has(name));
        // feat: filter ns
        optNameList = optNameList.filter((name) => !this.ns.has(name));
        // optNameList=optNameList.join(`\n`)

        // idea: option part
        let opts;
        map = optionMap;
        opts = Object.keys(map)
            .filter((name) => optNameList.includes(name))
            .map((name) => map[name]);
        opts = getFormatOptStr(opts, " ", 2);
        opts = `option:\n${opts}`;
        // opts=getFormatOptStr(opts,' ',2)

        let subns = [...this.ns].filter((v) => v.trim()).join("|");
        subns = subns ? `subns:${subns}` : "";

        // log([...this.cmd].filter(v=>v.trim()))
        let subcmd = [...this.cmd].filter((v) => v.trim()).join("|");
        subcmd = subcmd ? `subcmd:${subcmd}` : "";

        let usage = `usage:{ns} [option]`;
        if (subns) {
            usage = usage.replace(/\[option\]$/, "[subns] [option]");
        }
        if (subcmd) {
            usage = usage.replace(/\[option\]$/, "[subcmd] [option]");
        }

        if (subcmd) {
            opts = `${subcmd}\n${opts}`;
        }
        if (subns) {
            opts = `${subns}\n${opts}`;
        }
        opts = getFormatOptStr(opts, " ", 2);
        if (usage) {
            opts = `${usage}\n${opts}`;
        }
        // opts=getFormatOptStr(opts,' ',2)
        // this.usagemsg =opts
        return opts;
    }
    //name,type,value,desc
    /**
     * add option by json (param)
     * @param {{name:string,type:string,value:*,desc:string}[]} list
     */
    param(list) {
        let { paramMap } = this;
        list.forEach((v) => {
            // store param item
            if (!paramMap[v.name]) paramMap[v.name] = v;
            // to option item
            let { name, type, value, desc } = v;
            this.addOpt(`${name} ${desc}`);
            // to builtIn confg
        });
        return this;
    }
    /**
     * 
     * @param {getBuiltinFlagsOption} options 
     * @returns 
     */
    getBuiltinConfig(options = {}) {
        let { paramMap } = this;
        let res = {};
        let list = Object.keys(paramMap).map((k) => paramMap[k]);
        let option={
            slim:true,
            modeStyle:'cli',
            ...options,
        }
        if(option.mode=='string'){
            option.slim=true
        }
        for (let index = 0; index < list.length; index++) {
            const v = list[index];
            let { name, type, value, desc } = v;
            let [s, l] = name
                .split(/,/)
                .map((v) => v.trim().replace(/^\-*/gi, ""));

            // res[name] = value;
            let hasLong = s && l != undefined;
            let thelong = s.length > 1 ? s : l;
            
            //desc: set value for the long name 
            if (thelong) {
                // feat: auto camelize
                if (!option.noAutoCamelize) {
                    res[camelize(thelong.replace(/-+/gi, " "))] = value;
                }
                // feat: slim them
                if (option.slim) continue
                res[thelong] = value;
            }
            //desc: set value for the short name 
            res[s] = value;
        }
        if(option.mode=='string' && option.modeStyle=='cli'){
            res=Object.keys(res).map(v=>{
                if(v.length>1){
                    return `--${v}=${res[v]}`
                }
                return  `-${v}=${res[v]}`
            }).join(" ")
        }
        if(option.mode=='string' && option.modeStyle=='httpquery'){
            res=Object.keys(res).map(v=>{
                return  `${v}=${res[v]}`
            }).join("@")
        }
        if(option.mode=='string' && option.modeStyle=='swithoption'){
            res=Object.keys(res).map(v=>{
                return  `${v}=${res[v]}`
            }).join(";")
        }
        return res;
    }
    getRootEntryOption(ns = "npm-bin", version = "1.0.0") {
        let { usagemsg } = this;
        let option = {};
        option = {
            ...option,
            ...{
                version,
                ns,
                autoSubCmd: getTxtFromUsage("subcmd", usagemsg),
                autoSubNs: getTxtFromUsage("subns", usagemsg),
            },
        };
        // this.rootEntryOption = option
        return option;
    }
}

class BindEntry {
    constructor() {}

    entrys(entry) {
        // set
        if (entry) {
            this.context = entry;
            return this;
        }
        // get
        return this.context;
    }

    bind(subcmd = "", defFun = () => {}, bindType = "") {
        const entrys = this.entrys();

        subcmd.split("|").forEach((cmd) => {
            let entry;
            switch (bindType.toLowerCase()) {
                case "call":
                    // feat: support call then bind entry
                    entry = defFun(cmd);
                    break;
            }
            // feat: support bind entry
            entrys[cmd] = entry;
        });
    }
}
/**
 *
 * @param {{entrys:object,subcmd:string,defFun:() => {},bindType:string}} option
 */
function bindEntry(option) {
    let { subcmd, defFun, bindType } = option;
    const be = new BindEntry();
    be.entrys(option.entrys);
    be.bind(subcmd, defFun, bindType);
}

const getTxtFromUsage = (s, usage = "") => {
    const regexp = new RegExp(` *${s}:.*`, "ig");
    const match = usage.match(regexp);
    if (match) {
        return match[0].replace(new RegExp(` *${s}:`, "i"), "");
    }
    return "";
};
/**
 * usage to root entry option
 * @param {*} ns
 * @param {*} version
 * @param {*} usage
 * @returns
 */
const usageToOption = (ns = "npm-bin", version = "1.0.0", usage = "") => {
    let option = {};
    option = {
        ...option,
        ...{
            version,
            ns,
            autoSubCmd: getTxtFromUsage("subcmd", usage),
            autoSubNs: getTxtFromUsage("subns", usage),
        },
    };
    return option;
};
//CliUsageHelp
//usage.getTxt -> usage.toOption
// class CliUsageHelp {
//     constructor(){
//         this.usage=''
//     }
//     getTxt(exp){
//         let {usage} = this
//         const regexp = new RegExp(` *${exp}:.*`, "ig");
//         const match = usage.match(regexp);
//         if (match) {
//             return match[0].replace(new RegExp(` *${exp}:`, "i"), "");
//         }
//         return "";
//     }
//     toOption(ns = "npm-bin", version = "1.0.0"){
//         return usageToOption(ns,version,this.usage)
//     }
// }

function getDefaultOption() {
    return {
        helpmsg: "usage:ns option",
        argvIndexS: 2, // argv index start position
        enbaleSubCmd: false,
        subcmd: "",
        allowAutoSubCmd: true,
        autoSubCmd: "",
        version: "1.0.0",
        // ns : getRelScriptFileName(),
        ns: "ycs",
        enbaleSubNs: false,
        subns: "",
        allowAutoSubNs: true,
        autoSubNs: "",
    };
}
class Ycs {
    constructor() {
        this.option = getDefaultOption();
    }

    ns(s = "ns") {
        this.option.ns = s;
        return this;
    }

    version(s = "1.0.0") {
        this.option.version = s;
        return this;
    }

    entry(entrys = {}) {
        let ycs = this;
        // let {option} = ycs
        // let {entrys} = option

        // idea: bind entrys.option to ysc.option
        if (entrys.option) {
            ycs.option = {
                ...ycs.option,
                ...entrys.option,
            };
        }

        // idea: bind entrys.xx to ysc.option
        // xx is some of version,ns,autoSubCmd,autoSubNs
        "version,ns,autoSubCmd,autoSubNs".split(",").forEach((item) => {
            if (entrys[item]) {
                ycs.option[item] = entrys[item];
            }
        });
        ycs.option.entrys = entrys;
        return this;
    }

    autosubcmd(s = "") {
        this.option.autoSubCmd = s;
        return this;
    }

    autosubns(s = "") {
        this.option.autoSubNs = s;
        return this;
    }

    nanoparse(f = () => {}) {
        this.option.nanoparse = f;
        return this;
    }

    /**
     * run entry
     * @param {string[]} input
     * @returns
     */
    run(input) {
        // let input = process.argv

        // idea: extract share var
        let {
            entrys,
            helpmsg,
            argvIndexS,
            enbaleSubCmd,
            subcmd,
            allowAutoSubCmd,
            autoSubCmd,
            version,
            // ns ,
            ns,
            enbaleSubNs,
            subns,
            allowAutoSubNs,
            autoSubNs,
            nanoparse,
        } = this.option;

        // idea: input format is 'ns [subcmd] [option]'
        // option is argv

        // feat: auto check sub ns enable
        if (!enbaleSubNs && allowAutoSubNs && autoSubNs) {
            autoSubNs = Array.isArray(autoSubNs)
                ? autoSubNs
                : autoSubNs.split("|");
            enbaleSubNs = autoSubNs.includes(input[argvIndexS]);
        }

        // feat: support sub ns
        if (enbaleSubNs) {
            subns = input[argvIndexS];
            argvIndexS++;
            helpmsg = helpmsg.replace(/option$/, "subns option");
        }

        // feat: auto check sub cmd enable
        if (!enbaleSubCmd && allowAutoSubCmd && autoSubCmd) {
            autoSubCmd = Array.isArray(autoSubCmd)
                ? autoSubCmd
                : autoSubCmd.split("|");
            enbaleSubCmd = autoSubCmd.includes(input[argvIndexS]);
        }

        // feat: support sub cmd
        if (enbaleSubCmd) {
            // subcmd = input[2]
            subcmd = input[argvIndexS];
            argvIndexS++;
            // helpmsg=`usage:ns subcmd option`
            helpmsg = helpmsg.replace(/option$/, "subcmd option");
        }

        // feat: get usage,entry,version
        // helpmsg is alias of usage
        let entry = entrys;
        helpmsg = entrys.usage;

        if (enbaleSubNs && subns) {
            if (!entry[subns]) {
                log(`${helpmsg}`);
                log(`todo:subns:${subns}`);
                // process.exit(1)
                return;
            }
            // log(`run subns ${subns}`)
            helpmsg = entry[subns].usage ? entry[subns].usage : helpmsg;
            version = entry[subns].version ? entry[subns].version : version;
            entry = entry[subns] ? entry[subns] : () => {};
        }

        if (enbaleSubCmd && subcmd) {
            if (!entry[subcmd]) {
                log(`${helpmsg}`);
                log(`todo:subcmd:${subcmd}`);
                // process.exit(1)
                return;
            }
            // log(`run subcmd ${subcmd}`)
            helpmsg = entry[subcmd].usage ? entry[subcmd].usage : helpmsg;
            version = entry[subcmd].version ? entry[subcmd].version : version;
            entry = entry[subcmd] ? entry[subcmd] : () => {};
        }
        // helpmsg=defUsage()

        // feat: check argv length
        let invalidArgvLength = input.length <= argvIndexS;

        if (entrys.enableZeroOption) {
            invalidArgvLength = input.length < argvIndexS;
        }
        if (entry.enableZeroOption) {
            invalidArgvLength = input.length < argvIndexS;
        }
        // if (enbaleSubNs && subns) {
        //   if (entry[subns] && entry[subns].enableZeroOption) {
        //     invalidArgvLength = input.length < argvIndexS
        //   }
        // }
        // if (enbaleSubCmd && subcmd) {
        //   if (entry[subcmd] && entry[subcmd].enableZeroOption) {
        //     invalidArgvLength = input.length < argvIndexS
        //   }
        // }

        if (invalidArgvLength) {
            log(`${helpmsg}`);
            log("error:invalid argv length");
            return;
        }

        // feat: parse nano argv
        // let [,,...sinput ] = input
        // let sinput = input.slice(2)
        const sinput = input.slice(argvIndexS);

        // flags vs _ vs extras
        let parser = nanoparse ? nanoparse : argsParser;
        const argv = parser(sinput);
        // log(sinput)
        // log(argv)
        const option = argv.flags;

        // feat: support log flags,_,and extras
        if (option.debugArgs || option.da) {
            // log(argv.flags)
            // log(argv._)
            // log(argv.extras)
            log(argv);
        }

        // feat: support out version
        if (option.version || option.v) {
            log(`${ns} version:${version}`);
            return;
        }

        // feat: support out help
        if (option.help || option.h) {
            log(`${helpmsg}`);
            return;
        }

        // feat: support run main
        // let entry = entrys
        // if(enbaleSubCmd && subcmd){
        //   log(`run subcmd ${subcmd}`)
        //   entry=entrys[subcmd]?entrys[subcmd]:()=>{}
        // }
        // flags,_,extras
        // option is alias of flags
        if (entrys.notOnlyFlags || entry.notOnlyFlags) {
            return entry(argv);
        }
        return entry(option);
    }
}

const coh = new CliOptionHelp();
// usage = coh.param().usage()
// builtinconifg = coh.param().getBuiltinConfig()
// option=usageToOption(ns,version,usage)
// bindEntry(option)

// log(`[info] set param or option`)
// coh.param([{
//     name:'-h,--help',
//     type:'',
//     value:'',
//     desc:'info help'
// }])
// // coh.addOpt(`-h,--help get help`);
// coh.addOpt(`-v,--version get version`);
// log(`[info] set ns or cmd`)
// const ns = 'ini-pkg';
// const cmd = 'add';
// log(`[info] param to entry.usage`)
// log(`[info] or: write usage`)
// let usage = coh.usage(ns,cmd)//defUsage(ns);
// usage =  coh.usage()//defUsage(ns);
// log(usage)

// log(`[info] usage to entry.option`)
// const option = coh.getRootEntryOption(ns, '1.0.0');
// log(option)
// log(`[info] get entry built in config`)
// let builtinConfig = coh.getBuiltinConfig()
// log(builtinConfig)
// log(coh)

function defEntry(options = {}) {
    let opts = {
        fn: () => {},
        enableZeroOption:true,
        notOnlyFlags:true,
        ...options,
    };
    let entrys = opts.fn;
    entrys.usage = opts.usage;
    entrys.option = opts.option;
    // entrys.autoSubCmd= usage.match(/subcmd:.*/ig)[0]

    // feat: enable zero option
    // entrys.log.enableZeroOption=true
    // entrys.cls.enableZeroOption=true
    entrys.enableZeroOption = opts.enableZeroOption;

    entrys.notOnlyFlags = opts.notOnlyFlags;
    return entrys;
}
function runEntry(entrys) {
    const ycs = new Ycs();
    ycs.nanoparse(argsParser).entry(entrys).run(process.argv);
    // return ycs
}
//entry,option,usage
//entry,param

class YcsNext {
    constructor() {
        this.too = new CliOptionHelp();
        this.data = {};
        this.ycs = new Ycs()
        this.ycs.nanoparse(argsParser)
    }
    param(list) {
        let { too } = this;
        too.param(list);
        return this;
    }
    usage(...args) {
        let { too, data } = this;
        data.usage = too.usage(...args);
        return this;
    }
    option(ns, version) {
        let { too, data } = this;
        data.option = too.getRootEntryOption(ns, version);
        return this;
    }
    entry(option = {}) {
        let { data,ycs } = this;
        data.entry = defEntry({
            ...{ usage: data.usage, option: data.option, ...option },
        });
        // log(data.entry,data.usage)
        ycs.entry(data.entry)
        return this;
    }
    run() {
        let { data,ycs } = this;
        // runEntry(data.entry);
        // ycs.nanoparse(argsParser).entry(data.entry)
        // ycs.entry(data.entry)
        ycs.run(process.argv);
    }
    new() {
        return new YcsNext();
    }
    /**
     * 
     * @param {object} flags 
     * @param {camelizeFlagsOption} options 
     * @returns 
     */
    camelizeFlags(flags={},options={}){
        // let res = {}
        let option = {
            slim:true,
            ...options
        }
        if(option.noAutoCamelize) return flags
        Object.keys(flags).forEach(k=>{
            let ck = camelize(k.replace(/-+/gi, " "))
            // res[ck]=flags[k]
            if(ck!=k){
                flags[ck]=flags[k]
                if(option.slim){
                    delete flags[k]
                }   
            }
        })
        return flags
    }
    getBuiltinFlags(...args) {
        let { too } = this;
        return too.getBuiltinConfig(...args);
    }
    getCurrentFlags(...args){
        let { data,ycs } = this;
        let entrys = data.entry
        let builtinFlags = this.getBuiltinFlags()
        let nowFlags;
        let cliFlags = args[0]
        if (entrys.notOnlyFlags) {
            nowFlags = { ...builtinFlags, ...cliFlags.flags };
        } else {
            nowFlags = { ...builtinFlags, ...cliFlags };
        }
        nowFlags = this.camelizeFlags(nowFlags,args[1])
        return nowFlags
    }
    getCliFlags(...args){
        let { data } = this;
        let entrys = data.entry
        let cliFlags  =args[0]
        if (entrys.notOnlyFlags) {
            cliFlags= cliFlags.flags
        } else {
            cliFlags= cliFlags
        }
        cliFlags= this.camelizeFlags(cliFlags,args[1])
        return cliFlags
    }
}

const ycs = new YcsNext();
// export { getTxtFromUsage, usageToOption, bindEntry,argsParser as parseArgs,coh,defEntry,runEntry };

export { ycs };

// node lib/cli-help.js
// node lib/cli-help.js --c=a
