// feat: use built in flags
const builtinFlags = {
    name: ".ymcrc.json",
    wkd: "packages/noop",
    usd: false,
    crd: true,
};

// idea:cli-fy api to cli with ymc style
const entrys = (flags = {}) => {
    // log nano parser result 's flags (flags vs _ vs extras)
    // log(flags)
    entrys.debug && log("[info] run cmd with: ns");
    entrys.debug && log("[info] hello ns");
    // do sth. here
    entrys.debug && log("[info] log cli option:");
    entrys.debug && log(flags);
};
// 1. gen cmd fun
const defFun =
    (cmd = "add") =>
    (cliFlags = {}) => {
        entrys.debug && log(`[info] run cmd with: ns ${cmd}`);
        entrys.debug && log(`[info] hello ${cmd}`);

        // do sth. here
        // log(`[info] log cli option:`)
        // log(cliFlags)

        // let nowFlags = { ...builtinFlags, ...cliFlags }
        let nowFlags;
        builtinFlags.wkd = "";
        if (entrys.notOnlyFlags) {
            nowFlags = { ...builtinFlags, ...cliFlags.flags };
        } else {
            nowFlags = { ...builtinFlags, ...cliFlags };
        }

        // comEntry(cmd, nowFlags)
        entrys.debug && log("[info] log now flags:");
        entrys.debug && log(nowFlags);
        jcm.option = nowFlags;
        jcm.tool = {
            parsePath,
            joinPath,
            addDirs,
            delDirs,
            readJson,
            saveJson,
            getUserHome,
        };

        if (cmd == "loc") {
            const file = jcm.getFileLocList(); // jcm.getFileLoc()
            log("[info] cnf file list:");
            log(file);
            log("[info] the last file:");
            log(file[file.length - 1]);
            // log(jcm.tool.parsePath(file[file.length - 1]))
            return;
        }
        return jcm.comEntry(cmd);
    };
// 2. bind cmd fun
const ge = new GE();
// let subcmd = getTxtFromUsage('subcmd', usage)
// ge.entrys(entrys).bind('add|get|del|put|cls|log',defFun,'call')
ge.entrys(entrys).bind("add|del|put|get", defFun, "call");
ge.entrys(entrys).bind("loc|cnf", defFun, "call");
// ge.entrys(entrys).bind(subcmd, defFun, 'call')

// ge.entrys(entrys).bind('eslint|jest|babel|tsc', defFun, 'call')
// log(entrys)

// entrys.add = (flags = {}) => {
//   flags = { ...builtinFlags, ...flags }
//   comEntry('add', flags)
// }
// entrys.del = (flags = {}) => {
//   flags = { ...builtinFlags, ...flags }
//   comEntry('del', flags)
// }
// entrys.get = (flags = {}) => {
//   flags = { ...builtinFlags, ...flags }
//   let data = comEntry('get', flags)
//   let key, value
//   key = flags.k || flags.key
//   value = data.bin[key]
//   log(`${key} ${value}`)
// }
// entrys.put = (flags = {}) => {
//   flags = { ...builtinFlags, ...flags }
//   comEntry('put', flags)
// }
// entrys.cls = (flags = {}) => {
//   flags = { ...builtinFlags, ...flags }
//   comEntry('cls', flags)
// }

// entrys.log = (flags = {}) => {
//   flags = { ...builtinFlags, ...flags }
//   comEntry('log', flags)
// }

const ns = "jcm";
const usage = defUsage(ns);
const option = genOptionFromUsage(ns, "1.0.0", usage);

entrys.usage = usage;
entrys.option = option;

// feat: enable zero option
entrys.cnf.enableZeroOption = true;
// entrys.log.enableZeroOption=true
// entrys.cls.enableZeroOption=true
// feat(cli): en-able ns zero arg\n with entrys.enableZeroOption=true
entrys.enableZeroOption = true;
// feat(cli): en-able _ and extras\nwith entrys.notOnlyFlags=true
entrys.notOnlyFlags = true;
// feat(cli): en-able debug lib-clify \nwith entrys.debug=true
entrys.debug = true;
