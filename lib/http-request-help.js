import { URL, parse as parseUrl, format as formatUrl } from "url";
import "./common-type.js";
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

/**
 *
 * @param {pathParamTransferOption} pathJson
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

//https://nodejs.org/docs/latest-v16.x/api/url.html
class HttpRequestHelp {
    constructor() {
        this.ini();
    }
    ini() {
        this.param = {};
        this.data = {};
        this.headers = {};
        this.host=''
        this.path=''
        this.method=''
        return this
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
    /**
     * 
     * @param {string} host 
     * @returns 
     */
    setHost(host){
        if(host){
            this.host=host
        }
        return this
    }
    /**
     * 
     * @param {string} apiExp 
     * @returns 
     */
    setApiExp(apiExp){
        if(apiExp){
            let [method,path]= apiExp.split(" ").map(v=>v.trim())
            if(method){
                this.method = method.toUpperCase()
            }
            this.path = path
        }
        return this
    }
    /**
     * 
     * @returns {string}
     */
    getSearch(){
        let { param} = this;
        if (typeof param == "object") {
            param = setPathParamToString(param,{toSearch:true});
        } 
        return param
    }
    getUrl(){
        let res =''
        let { param, data, headers,method,path,host} = this;
        if(host){
            res=`${res}${host}`
        }

        if([path]){
            res=`${res}${path}`
        }

        let search = this.getSearch()
        if (search) {
            res=`${res}${search}`
        }
        return res;
    }
    toRequestOption() {
        let res = {};
        let { data, headers,method } = this;
        let {protocol,hostname,path} = parseUrl(this.getUrl());
        // log(parseUrl(this.getUrl())) //url.parse(url) vs new URL(url)
        res.protocol = protocol
        res.hostname = hostname
        res.path = path //pathname + search
        
        //set headers
        if (Object.keys(headers).length > 0) {
            res.headers = headers;
        }
        // set body param
        if (Object.keys(data).length > 0) {
            res.data = data;
        }  
        return res;
    }
}
const hrh = new HttpRequestHelp();
export {setHeadersToJson,setPathParamToString,setPathParamToJson,HttpRequestHelp,hrh}