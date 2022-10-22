#!/usr/bin/env node

import { createWriteStream, mkdirSync, rmSync, existsSync } from "fs";
import { request } from "https";
import { textstream } from "../lib/text-stream-io.js";
import { jsonstream } from "../lib/json-stream-io.js";
import { writeTpl } from "../lib/render-tpl.js";
import formatDate from "../lib/format-date.js";
import downloadFile from "../lib/download-file.js";
import { parse as parseUrl, format as formatUrl } from "url";
const { log } = console;
//https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
//https://it.knightnet.org.uk/kb/node-js/download-repo-github/

/**
 * speedup github - add prefix url to matched url
 * @param {string} url
 * @param {{map?:proxyDomainMap}} option
 * @returns {string}
 */
function speedUpGithubByUrl(url, option = {}) {
    let { map } = option;
    if (!map) {
        map = [
            ["https://github.com", "https://hub.fastgit.xyz"],
            ["https://raw.githubusercontent.com", "https://raw.fastgit.org"],
        ];
    }
    // log(`[info] add prefix to matched url`);
    // infoProxyDomainMap(map)

    // add prefix url when matched url
    let res = url;
    if (res) {
        map.forEach((item) => {
            const [doamin, proxyByDomain] = item;
            res = res.replace(new RegExp(`^${doamin}`, "ig"), proxyByDomain);
        });
    }
    return res;
}

/**
 *
 * @param {proxyDomainMap} map
 */
function infoProxyDomainMap(map) {
    let res = map
        .map((v) => {
            let [domain, proxyByDomain] = v;
            return `proxy:${proxyByDomain} domain:${domain}`;
        })
        .join("\n");
    log(res);
}

/**
 * get target file loc by url
 * @param {string} url
 * @param {{prefix:string}} option
 * @returns {string}
 * @description
 * ```
 * //idea:
 * //delete prefix
 * ```
 */
function url2des(url, option = {}) {
    let res = url;
    let { prefix } = option;
    if (prefix) res = res.replace(new RegExp(`.*${prefix}`), "");
    return res;
}

/**
 *
 * @param {string} likepath
 * @param {{split:string}} option
 */
function getDirLoc(likepath, option = {}) {
    let { split, splitReg } = {
        splitReg: /\/|\\/,
        split: "/",
        ...option,
    };

    let list = likepath.split(splitReg ? splitReg : split);
    let length = list.length;
    if (length > 1) {
        list = list.slice(0, length - 1);
        list = list.join(split);
    } else {
        list = "";
    }
    return list;
}
/**
 * chain async task
 * @param {()=>{}} tasks
 * @returns
 */
async function chaintask(tasks) {
    let chain = Promise.resolve(null);
    for (let index = 0; index < tasks.length; index++) {
        const task = tasks[index];
        chain = chain.then((v) => task()).catch(console.log);
    }
    return await chain;
}

//https://axios-http.com/docs/api_intro

//adapter request for axios (todo)
//adapter request for node http(s) (todo)

// https://nodejs.org/dist/latest-v16.x/docs/api/http.html#httprequestoptions-callback

/**
 *
 * @param {string} headers
 * @param {{split?:string|regexp}} option
 * @returns {{[string]:string}}
 */
function setHeadersToJson(headers, option = {}) {
    let opts = {
        linkKeyAndVal: /:/,
        span: /\r?\n/,
        ...option,
    };
    let header = {};
    let cache = headers.trim().split(opts.span);
    cache.forEach((v) => {
        let [key, val] = v.trim().split(opts.linkKeyAndVal);
        // log(key, val)
        header[key] = val;
    });
    return header;
}
/** @typedef {{linkKeyAndVal:string,span:string}} pathParamTransferOption */
/**
 *
 * @param {*} pathJson
 * @param {*} option
 * @returns {string}
 * @sample
 * ```
 *
 * ```
 */
function setPathParamToString(pathJson = {}, option = {}) {
    let keys = Object.keys(pathJson);
    let opts = {
        linkKeyAndVal: "=",
        span: "&",
        ...option,
    };
    let res;
    // feat: json to string
    res = keys
        .map((key) => `${key}${opts.linkKeyAndVal}${pathJson[key]}`)
        .join(opts.span);

    // feat: wrap question mark
    if (opts.wrapQuestionMark || opts.toSearch) {
        res = query2search(res);
    }
    // feat: wrap to path
    if (opts.wrapToPath || opts.toPath) {
        res = query2path(res, opts.pathname);
    }
    return res;
    function json2string(j, o) {}

    function query2search(q) {
        let res = q;
        if (!/^\?/.test(res)) res = `?${res}`;
        return res;
    }
    function query2path(q, pathname) {
        let res = q;
        if (pathname) {
            res = query2search(res);
            res = `${pathname}${res}`;
        }
        return res;
    }
}
// log(setPathParamToString({ page: '4', sort: 'updated' })) //page=4&sort=updated
// log(setPathParamToString({ page: '4', sort: 'updated' }, { toPath: true, pathname: '/users/ymc-github/starred' })) ///users/ymc-github/starred?page=4&sort=updated
// log(encodeURIComponent('page=4&sort=updated'))

function setPathParamToJson(s = "", option = {}) {
    let res = {};
    let opts = {
        linkKeyAndVal: "=",
        span: "&",
        ...option,
    };
    let query = s;
    // feat: search to query
    if (opts.toQuery) {
        query = search2query(query);
    }

    //feat: query to json
    query.split(opts.span).forEach((v) => {
        let [key, val] = v.split(opts.linkKeyAndVal);
        res[key] = val;
    });
    return res;

    function search2query(q) {
        let res = q;
        res = res.replace(/^\?/, "");
        return res;
    }
}
// log(setPathParamToJson('page=4&sort=updated'))//{ page: '4', sort: 'updated' }
// log(setPathParamToJson('?page=4&sort=updated', { toQuery: true })) //{ page: '4', sort: 'updated' }

// log(parseUrl('https://api.github.com/users/ymc-github/starred'))

// log(setPathParamToJson('page=4&sort=updated')) //
// setPathParamToString({ page: '4', sort: 'updated' })
//set body param

class requestOptionHelp {
    constructor() {
        this.ini();
    }
    ini() {
        this.param = {};
        this.data = {};
        this.headers = {};
    }
    /**
     *
     * @param {string|object} headersExp
     * @returns
     */
    setHeaders(headersExp) {
        let param = headersExp;
        if (typeof param == "string") {
            param = setPathParamToJson(param, {
                linkKeyAndVal: /:/,
                span: /\r?\n/,
            });
        }
        let keys = Object.keys(param);
        let cache = this.headers;
        keys.forEach((key) => {
            cache[key] = param[key];
        });
        return this;
    }

    /**
     *
     * @param {string|object} paramExp
     * @returns
     */
    setParam(paramExp) {
        let param = paramExp;
        if (typeof param == "string") {
            param = setPathParamToJson(param);
        }
        let keys = Object.keys(param);
        let cache = this.param;
        keys.forEach((key) => {
            cache[key] = param[key];
        });
        return this;
    }
    /**
     *
     * @param {string|object} bodyExp
     * @returns
     */
    setBody(bodyExp) {
        let param = bodyExp;
        if (typeof param == "string") {
            param = setPathParamToJson(param);
        }
        let keys = Object.keys(param);
        let cache = this.data;
        keys.forEach((key) => {
            cache[key] = param[key];
        });
        return this;
    }
    toOption(url) {
        let res = {};
        let { param, data, headers } = this;

        //set headers
        if (Object.keys(headers).length > 0) {
            res.headers = headers;
        }

        //set path param
        if (typeof param == "object") {
            param = setPathParamToString(param);
        }
        if (param) {
            res.query = param;
        }

        // set body param
        if (Object.keys(data).length > 0) {
            res.data = data;
        }
        if (url) {
            // res.url = url
            // url = `${url}${param}`
            let parsedUrl = parseUrl(url);
            // res.hostname = parsedUrl.hostname
            res.path = parsedUrl.path;
        }

        return res;
    }
}

/**
 *
 * @param {{}[]} data
 * @param {{keys:string|string[],span?:string}} option
 * @returns {{}[]}
 */
function slimDataByKeys(data, option) {
    let opts = {
        span: ";",
        ...option,
    };
    let list = opts.keys;
    list = isString(list) ? list.split(opts.span) : list;
    return data.map((item) => {
        const slim = {};
        list.forEach((key) => {
            if (key in item) {
                slim[key] = item[key];
            }
        });
        return slim;
    });
    function isString(s) {
        return typeof s == "string";
    }
}

/**
 *
 * @param {{owner:string,repo:string,branch:string,filepath:string}} data
 * @param {{host?:string,urlTpl?:string}} option
 * @returns {string}
 */
function getGithubFileUrl(data, option) {
    let opts = {
        host: "https://raw.githubusercontent.com/",
        urlTpl: `{host}{owner}/{repo}/{branch}/{filepath}`,
        ...option,
    };
    if (data && !data.host) {
        data.host = opts.host;
    }
    return writeTpl(opts.urlTpl, data);
}

const run = async () => {
    // log(`[info] info feat:`)
    // log(feats.trim())

    // https://gist.github.com/gkhays/fa9d112a3f9ee61c6005136ebda2a6fd
    //https://github.com/YMC-GitHub/ymc-github/raw/main/README.md
    let filesPreset = [];
    // speedUpGithubByUrl(filesPreset)

    let item = {
        file: `tmp/updated-time.md`,
        url: `raw.githubusercontent.com/<owner>/<repo>/<branch>/<filename>`,
    };
    //feat: render url tpl
    // item.url = renderUrlTpl(item.url,{owner:'ymc-github',repo:'ymc-github',branch:'main'})

    log(`[info] get des by url`);
    let url, des;
    // k8s dashboard
    url =
        "https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml";
    // des = url2des(url, { prefix: 'deploy/' })
    des = url2des(url, { prefix: "kubernetes/" });
    // log(`[info] wrap url,des to target item`);
    item = { url, file: des };
    // log(`[info] target add item`);
    // filesPreset = [];
    filesPreset.push(item);

    // the time of automation
    url = `https://raw.githubusercontent.com/ymc-github/ymc-github/main/updated-time.md`;
    // url=getGithubFileUrl({owner:'ymc-github',repo:'ymc-github',branch:'main',filepath:'updated-time.md'})

    des = url2des(url, { prefix: "githubusercontent.com/" });
    filesPreset.push({ url, file: des });

    // mono repo root package.json
    url = `https://raw.githubusercontent.com/ymc-github/js-idea/main/package.json`;
    des = url2des(url, { prefix: "githubusercontent.com/" });
    filesPreset.push({ url, file: des });


    // eryajf 's github repo stars
    url = getGithubFileUrl({
        owner: "eryajf",
        repo: "awesome-stars-eryajf",
        branch: "main",
        filepath: "README.md",
    });
    des = url2des(url, { prefix: "githubusercontent.com/" });
    filesPreset.push({ url, file: des });

    // url json exp
    //search vs query in urlJsonExp
    //path vs pathname in urlJsonExp
    // setPathParamToString()
    // log(parseUrl(url))

    log(`[info] set des to tmp`);
    filesPreset = filesPreset.map((item) => {
        item.file = `tmp/${item.file}`;
        return item;
    });

    log(`[info] add des fa dir`);
    let dirloclist = [];
    dirloclist = filesPreset
        .map((item) => getDirLoc(item.file))
        .filter((v) => v && v != "." && v != "..");
    // log(dirloclist)
    dirloclist.forEach((loc) => {
        mkdirSync(loc, { recursive: true });
    });

    log(`[info] pro url by url`);
    filesPreset.forEach(v=>{
        v.url = speedUpGithubByUrl(v.url)
    })
    // log(`[info] info files preset`)
    // log(filesPreset)

    // process.exit(0)
    log(`[info] dao url to des`);
    let downloadtasks
    //feat: chain downloading one by one (todo)
    downloadtasks = filesPreset.map(item => async () => downloadFile(item.url, item.file))
    // downloadtasks = filesPreset.map(item => async () => {
    //     let option = { targetFile: item.file, overideTargetFile: false }
    //     option = {targetFile: '' }
    //     return downloadFile(item.url, option)
    // })
    downloadtasks = await chaintask(downloadtasks)
    log(downloadtasks)

    // log(`[task] download the last`)
    // item = filesPreset[filesPreset.length - 1]
    // await downloadFile(item.url, item.file)
    // process.exit(0)

    //starred_at,repo.full_name,description,languages_url
    // log(`[info] delete tmp files`)
    // rmSync(`tmp/`, { recursive: true })
};

function setReqBaseOption(headerlist) {
    let res;
    const roh = new requestOptionHelp();
    roh.setHeaders(setHeadersToJson(headerlist));
    roh.setParam("page=4&sort=updated");
    roh.setBody("page=4&sort=updated");
    roh.setBody({ page: "4", sort: "updated" });
    res = roh.toOption();
    // log(res)
    return res;
}

run();

// file usage
// node bin/download.js url

//error list
//Error: connect ETIMEDOUT 151.101.108.133:443
let error=`
node:internal/process/promises:279
            triggerUncaughtException(err, true /* fromPromise */);
            ^

Error: read ECONNRESET
    at TLSWrap.onStreamRead (node:internal/stream_base_commons:217:20) {
  errno: -4077,
  code: 'ECONNRESET',
  syscall: 'read'
}
`
error=`
Error: connect ETIMEDOUT 151.101.108.133:443
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1157:16) {
  errno: -4039,
  code: 'ETIMEDOUT',
  syscall: 'connect',
  address: '151.101.108.133',
  port: 443
}
`