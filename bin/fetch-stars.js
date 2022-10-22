import { createWriteStream, mkdirSync, rmSync, existsSync } from "fs";
import { textstream } from "../lib/text-stream-io.js";
import { jsonstream } from "../lib/json-stream-io.js";
import { writeTpl } from "../lib/render-tpl.js";
import formatDate from "../lib/format-date.js";
import downloadFile from "../lib/download-file.js";
import { setHeadersToJson, hrh } from "../lib/http-request-help.js";
import { URL, parse as parseUrl, format as formatUrl } from "url";
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

function getMainLangues(languages = {}) {
    let res = "";
    let vals = Object.values(languages);
    let max = Math.max(...vals);
    let keys = Object.keys(languages);
    // log(keys, vals, max)
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];

        if (languages[key] == max) {
            res = key;
            break;
        }
    }
    return res;
}

/**
 * @typedef {donwloadFileOption|{limitFecthLanguage?:number}} options
 */
async function fectDataByPage(options) {
    log(`[task] fetch data by page`);

    // log(requestUrl)
    //https://thewebdev.info/2022/03/05/how-to-make-a-http-get-request-with-query-string-parameters-with-node-js

    let { url } = options;
    // url = 'https://api.github.com/users/ymc-github/starred?page=4&sort=updated'
    // const requestUrl = parseUrl(url)
    // // log(requestUrl)
    // options.hostname = requestUrl.hostname
    // options.path = requestUrl.path
    // //parseUrl(url), options, res
    // // downloadByRequest(options)

    let downloadtasks;

    //feat: chain downloading one by one (todo)
    // downloadtasks = targets.map(item => async () => downloadFile(item.url, item.file))
    // downloadtasks = targets.map(item => async () => {
    //     let option = { ...options, targetFile: item.file, overideTargetFile: false }
    //     option = { ...options, targetFile: '' }
    //     return downloadFile(item.url, option)
    // })
    // downloadtasks = await chaintask(downloadtasks)
    // log(downloadtasks)

    // await Promise.all(targets.map(async (item) => download(item.url, item.file)));

    downloadtasks = await downloadFile(url, options);
    downloadtasks = [downloadtasks];

    let stars;
    // from file
    // jsonstream.init(`tmp/stars-list.json`)
    // stars = await jsonstream.read([])
    // from fetch
    stars = JSON.parse(downloadtasks);
    // log(stars)
    // process.exit(0)

    stars = stars.map((item) => {
        // 1
        // return item.repo
        // 2
        // let shimdata = slimDataByKeys(item.repo, 'full_name;description;languages_url')
        // shimdata.starred_at = item.starred_at
        // return shimdata

        return { starred_at: item.starred_at, ...item.repo };
    });

    log(`[info] shim repo data only with expect keys`);
    stars = slimDataByKeys(
        stars,
        {keys:"full_name;description;languages_url;starred_at"}
    );

    // log(stars)
    // process.exit(0)
    stars = stars.map((item) => {
        //
        item.url = item.languages_url;
        delete item.languages_url;
        return item;
    });

    // downloadtasks = encodeData(downloadtasks, options)
    // log(downloadtasks)

    if (options.limitFecthLanguage > 1) {
        log(`[info] debug with little sample`);
        stars = stars.slice(1, options.limitFecthLanguage);
        log(stars.length); //30?
    }
    // log(stars)

    log(`[info] fetch repo laguanges`);
    downloadtasks = stars.map((item) => async () => {
        // not save to file
        let option = { ...options, overideTargetFile: false };
        //option = { ...options, overideTargetFile: false }
        option = { headers: options.headers, overideTargetFile: false };
        let res = await downloadFile(item.url, option);
        log(`[info] repo laguanges : ${res}`);
        item.languages = JSON.parse(res);
        let mainlang = getMainLangues(item.languages);
        log(`[info] repo main laguange : ${mainlang}`);
        item.languages = mainlang;
        delete item.url;
        // log(res)
        return res;
    });
    downloadtasks = await chaintask(downloadtasks);
    // log(stars);
    return stars;
}

async function saveDataToStore(stars,storeloc = `tmp/stars-list-shim.all.json`) {
    log(`[task] save in data store.json`);
    // let storeloc = `tmp/stars-list-shim.all.json`;
    jsonstream.init(storeloc);
    let allstars = await jsonstream.read([]);

    // log(`[info] store loc: ${storeloc}`);
    // log(`[info] add to store`);
    stars.forEach((item) => {
        let { full_name } = item;
        let keys = allstars.map((i) => i.full_name);
        if (!keys.includes(full_name)) {
            allstars.push(item);
        }
    });
    await jsonstream.write(allstars);
    log(`[info] out: ${storeloc}`);
    return allstars;
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
async function main(flags = {}) {
    let option = {
        token: "",
        tokenFileLoc: "secrets/token-for-dev.txt",
        startPage: 1,
        lastPage: 1,
        sort: "updated",
        dataFileLoc:"",
        owner:'ymc-github',
        ...flags,
    };
    // let url = new URL(
    //     `https://api.github.com/users/ymc-github/starred?page=4&sort=updated`
    // );
    // log(url)
    let res;

    let headerlist = `
    Accept: application/vnd.github+json
    Authorization: Bearer <YOUR-TOKEN>
    `;
    //
    headerlist = `
    User-Agent: Awesome-Octocat-App
    Content-Type: application/json
    Accept: application/vnd.github.star+json
    Authorization: Bearer <YOUR-TOKEN>
    `;

    // read-token
    let token = option.token;
    if (!token) {
        textstream.init(option.tokenFileLoc);
        token = await textstream.read("");
        // ignore comment line and empty line
        token = token
            .split(/\r?\n/)
            .filter((v) => v.trim())
            .filter((v) => !/\/\//.test(v))[0];
    }
    if(!token){
        log(`[warn] need github token`);
        process.exit(1)
    }

    log(`[info] set header token in headerlist`);
    headerlist = headerlist.replace(new RegExp(`<YOUR-TOKEN>`, "ig"), token);

    // let pages = (1100 / 30).toFixed();
    // log(`[info] cal pages by stars number:${pages}`);

    let stars, allstars;

    // log(hrh)
    let s, e;
    [s, e] = [option.startPage, option.lastPage];
    // [s, e] = [1, 2] //fetch the first page
    // ;[s, e] = [1, pages] //fetch all pages
    let url, options;
    for (let index = s; index <= e; index++) {
        hrh.ini();
        hrh.setHeaders(setHeadersToJson(headerlist));
        hrh.setParam(`page=${index}&sort=${option.sort}`);
        // hrh.setBody(`page=4&sort=updated`);
        // hrh.setBody({ page: "4", sort: "updated" });
        hrh.setHost(`https://api.github.com`);
        hrh.setApiExp(`get /users/${option.owner}/starred`);
        ///ymc-github
        url = hrh.getUrl();
        options = hrh.toRequestOption();
        // options.limitFecthLanguage = 1 //30
        options.url = url;
        if (option.dbgInfoFetchOption) {
            log(options);
        }
        // if(option.dryRun?.includes(`main`)){
        //     log(`[info] dry run main`)
        // }
        if (option.dryRun) {
            log(`[info] dry run main`);
        } else {
            options.showProgess =true
            stars = await fectDataByPage(options);
            allstars = await saveDataToStore(stars,option.dataFileLoc);
        }
    }
    return res;
}
// const run = async () => {
//    await main()
// };
// run();

export default main;
// file usage
// node bin/fetch-stars.js
