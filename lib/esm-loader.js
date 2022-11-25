/**
 * @file
 * @description custom esm loader
 */
import { readFile } from "fs/promises";
import {
    join as joinPath,
    parse as parsePath,
    extname,
    resolve as resolvePath,
    sep as pathSep,
} from "path";
import { URL, pathToFileURL } from "url";
import createLoader from "./esm-loader-create.js";
import { jsonstream } from "./json-stream.js";
import { textfileio } from "./text-file-io-async.js";
//refs:
// export const { resolve, load } = await createLoader(config);
// node --experimental-loader ./path/to/loader.mjs your-file.js
// https://ar.al/2021/05/27/make-anything-a-javascript-module-using-node.js-esm-module-loaders/
// https://github.com/sebamarynissen/create-esm-loader

// https://github.com/esbuild-kit/esm-loader
// https://github.com/esbuild-kit/esm-loader/blob/develop/src/loaders.ts

const { log } = console;
// diretory-alias
const packages = "/path/to/components";
//@ymc/esm-loader-plugin-diretory-alias,@ymc/esm-loader-help-diretory-alias
function getExpDir(options = {}) {
    let option = {
        ...options,
    };
    let specifier = option.url;
    let { aliasmap } = option;
    let file;
    let keys = Object.keys(aliasmap);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const loc = aliasmap[key];
        //idea:repalce alias -> join-path -> path-to-url
        //feat: set the start-ed dir alias enable
        if (specifier.startsWith(key)) {
            const name = specifier.replace(new RegExp(`^${key}`, "i"), "");
            file = joinPath(loc, name);
            break;
            //feat: set any-pos dir alias enable //todo
        }
    }

    const url = pathToFileURL(file).href;
    return { url };
}
const directoryAliasLoader = {
    /**
     * resolve plugin - dirs alias
     * @param {*} specifier
     * @param {*} ctx
     * @returns
     */
    resolve(specifier, ctx) {
        return getExpDir({
            url: specifier,
            alisamap: { "@ymc/": "../packages/" },
        });
    },
};

//@ymc/esm-loader
//@ymc/esm-loader-alias # let loader support alias
//@ymc/alias-engine # manage alias name and val
//@ymc/alias-help # to other tool config , eg: babel,eslint,jest,rollup,esm-laoder,js-config,ts-config,vscode
//@ymc/module-alias-plugin-eslint
//@ymc/module-alias-plugin-jest
// get more on teaba

// std 1.1 get root path
const root = resolvePath(process.cwd(), ".");
// std 1.2 get alias map
// std 1.3 replace <root> expression
const aliasmap = {
    // "@ymc/": "../packages/",
    // "@ymc/": "./packages/",
    // "@ymc/": resolvePath(root, "./packages/"),
    "@ymc/": resolvePath(root, "<root>/packages/".replace(/^<root>/i, ".")),
    // "@ymc/": resolvePath(root, replaceRootExp("<root>/packages/")),
    // "@ymc/": replaceRootExp("<root>/packages/", ".."),
};

defineAlias(aliasmap, "@privatepkgs/", "scr/lib/"),
    defineAlias(aliasmap, "@private-pkgs/", "private-pkgs/"),
    // console.log(root);
    // console.log(aliasmap);

    /**
     * replace root expression
     * @param {*} s
     * @param {*} rootvalue
     * @param {*} rootreg
     * @returns
     */
    function replaceRootExp(s, rootvalue = ".", rootreg = /^<root>/i) {
        return s.replace(rootreg, rootvalue);
    };

/**
 * define alias - add key and val to alias map
 * @param {} aliasmap
 * @param {string} key
 * @param {string} val
 */
function defineAlias(aliasmap, key, val) {
    aliasmap[key] = resolvePath(root, `<root>/${val}`.replace(/^<root>/i, "."));
    // aliasmap[key] = resolvePath(root, `<root>/${val}`.replace(/^<root>/i, "."));
    // "@ymc/": "../packages/",
    // "@ymc/": "./packages/",
    // "@ymc/": resolvePath(root, "./packages/"),
    // "@ymc/": resolvePath(root, "<root>/packages/".replace(/^<root>/i, ".")),
    // "@ymc/": resolvePath(root, replaceRootExp("<root>/packages/")),
    // "@ymc/": replaceRootExp("<root>/packages/", ".."),
}
/**
 * replace alias - update url with alias map
 * @param {*} url
 * @param {*} aliasmap
 * @returns
 */
function replaceAlias(url, aliasmap) {
    const aliaskeys = Object.keys(aliasmap);
    for (let index = 0; index < aliaskeys.length; index++) {
        const aliaskey = aliaskeys[index];
        const alias = aliasmap[aliaskey];
        // if(option.resolve){
        //     alias=option.resolve(alias)
        // }
        if (url.startsWith(aliaskey)) {
            const reg = new RegExp(`^${aliaskey}`);
            const name = url.replace(reg, "");
            // url = `${alias}${name}`;
            url = `${alias}/${name}`;
            // url = url.replace(/\//gi, pathSep);
            // url = url.replace(/\\\\/gi, pathSep);
            url = url.replace(/\\/gi, "/");
            // fix: file url protocol warn in window
            // Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only file and data URLs are supported by the default ESM loader. On Windows, absolute paths must be valid file:// URLs. Received protocol 'h:'
            url = `file:///${url}`;
            // url = new URL(url).href;
            // console.log(name);
            // console.log(new URL(url));
            // log(`[info] alias url ${url}`);
        }
    }
    return url;
}
// pkg-alias

// default-ext

const fileProtocol = "file://";
const isPathPattern = /^\.{0,2}\//;
const tsExtensionsPattern = /\.([cm]?ts|[tj]sx)$/;
// const supportsNodePrefix =
//     compareNodeVersion([14, 13, 1]) >= 0 ||
//     compareNodeVersion([12, 20, 0]) >= 0;

export async function resolve(
    specifier,
    context,
    defaultResolve,
    recursiveCall
) {
    // Added in v12.20.0
    // https://nodejs.org/api/esm.html#esm_node_imports
    // if (!supportsNodePrefix && specifier.startsWith('node:')) {
    // 	specifier = specifier.slice(5);
    // }
    // console.log(specifier);
    // feat: reslove alias
    specifier = replaceAlias(specifier, aliasmap);
    // if (specifier.startsWith("@ymc/")) {
    //     let name = specifier.replace(/^@ymc\//, "");
    //     let file;
    //     file = `../packages/${name}`;
    //     specifier = file;
    // }

    // log(`[info] info url ${specifier}`);
    // log(specifier);

    //feat: support reslove diretory
    // If directory, can be index.js, index.ts, etc.
    if (specifier.endsWith("/")) {
        return await tryDirectory(specifier, context, defaultResolve);
    }

    const isPath =
        specifier.startsWith(fileProtocol) || isPathPattern.test(specifier);

    // if (
    //     tsconfigPathsMatcher &&
    //     !isPath && // bare specifier
    //     !context.parentURL?.includes("/node_modules/")
    // ) {
    //     const possiblePaths = tsconfigPathsMatcher(specifier);
    //     for (const possiblePath of possiblePaths) {
    //         try {
    //             return await resolve(
    //                 pathToFileURL(possiblePath).toString(),
    //                 context,
    //                 defaultResolve
    //             );
    //         } catch {}
    //     }
    // }

    // /**
    //  * Typescript gives .ts, .cts, or .mts priority over actual .js, .cjs, or .mjs extensions
    //  */
    // if (tsExtensionsPattern.test(context.parentURL)) {
    //     const tsPath = resolveTsPath(specifier);

    //     if (tsPath) {
    //         try {
    //             return await resolve(tsPath, context, defaultResolve, true);
    //         } catch (error) {
    //             const { code } = error;
    //             if (
    //                 code !== "ERR_MODULE_NOT_FOUND" &&
    //                 code !== "ERR_PACKAGE_PATH_NOT_EXPORTED"
    //             ) {
    //                 throw error;
    //             }
    //         }
    //     }
    // }

    let resolved;
    try {
        resolved = await defaultResolve(specifier, context, defaultResolve);
    } catch (error) {
        if (error instanceof Error && !recursiveCall) {
            if (error.code === "ERR_UNSUPPORTED_DIR_IMPORT") {
                return await tryDirectory(specifier, context, defaultResolve);
            }

            //feat: support reslove extentions
            if (error.code === "ERR_MODULE_NOT_FOUND") {
                return await tryExtensions(specifier, context, defaultResolve);
            }
        }
        throw error;
    }
    //feat: set format for json file
    if (resolved.url.endsWith(".json")) {
        return {
            ...resolved,
            format: "json",
        };
    }

    //feat: set format for module , commonjs or other
    let { format } = resolved;
    if (resolved.url.startsWith(fileProtocol)) {
        format = getFormatFromExtension(resolved.url) ?? format;

        // if (!format) {
        //     format = await getPackageType(resolved.url);
        // }
    }
    // console.log(resolved, format);
    return {
        ...resolved,
        format,
    };
}

async function tryDirectory(url, context, defaultResolve) {
    let res;
    res = await tryPackagejsonIndex(url, context, defaultResolve);
    if (res) {
        return res;
    }

    // feat: set default index to index
    let defalutIndex = "index";

    // feat: set default index to index.esm
    defalutIndex = "index.esm";
    const appendIndex = url.endsWith("/") ? defalutIndex : `/${defalutIndex}`;

    try {
        //feat: try extensions in diretory
        return await tryExtensions(url + appendIndex, context, defaultResolve);
    } catch (error) {
        const { message } = error;
        error.message = error.message.replace(
            `${appendIndex.replace("/", pathSep)}'`,
            "'"
        );
        error.stack = error.stack.replace(message, error.message);
        throw error;
    }
}

const extensions = [".js", ".json", ".ts", ".tsx", ".jsx"];
async function tryExtensions(url, context, defaultResolve) {
    let error;
    for (const extension of extensions) {
        try {
            return await resolve(
                url + extension,
                context,
                defaultResolve,
                true
            );
        } catch (_error) {
            if (error === undefined) {
                const { message } = _error;
                _error.message = _error.message.replace(`${extension}'`, "'");
                _error.stack = _error.stack.replace(message, _error.message);
                error = _error;
            }
        }
    }

    throw error;
}

async function tryPackagejsonIndex(url, context, defaultResolve) {
    const files = await getPackageIndexFiles(url, context, defaultResolve);
    let error;
    if (files.length < 0) return;
    for (const file of files) {
        try {
            // log(url + file);
            return await resolve(url + file, context, defaultResolve, true);
        } catch (_error) {
            if (error === undefined) {
                const { message } = _error;
                _error.message = _error.message.replace(`${file}'`, "'");
                _error.stack = _error.stack.replace(message, _error.message);
                error = _error;
            }
            throw error;
        }
    }
}

/**
 * get pkg index file
 * @param {string} url
 * @param {*} context
 * @param {*} defaultResolve
 * @returns
 * @description
 * ```
 * ## feat:
 * -
 * ```
 */
async function getPackageIndexFiles(url, context, defaultResolve) {
    const endswithsep = url.endsWith("/");
    // feat: has package.json

    // let loc = resolvePath(
    //     context.parentURL.replace("file:///", ""),
    //     packagejsonloc
    // );
    // console.log(loc, context);
    // new URL(loc)
    // console.log(context);
    // console.log(text);

    // step-x-s: get packagejson loc
    let packagejsonname, packagejsonloc, packagejson;
    packagejsonname = "package.json";
    packagejsonloc = endswithsep
        ? url + packagejsonname
        : `${url}/${packagejsonname}`;

    // packagejsonloc = resolvePath(
    //     context.parentURL.replace("file:///", ""),
    //     packagejsonloc
    // );
    // packagejsonloc = new URL(packagejsonloc);
    packagejsonloc = packagejsonloc.replace("file:///", "");
    // log(`[info] package.json loc : ${packagejsonloc}`);
    // step-x-e: get packagejson loc

    // step-x-s: get packagejson text
    // get packagejson
    jsonstream.init(packagejsonloc);
    packagejson = await jsonstream.read({});
    // textfileio.init(packagejsonloc);
    // let text = await textfileio.read();
    // step-x-e: get packagejson text

    // step-x-s: get index in packagejson
    // feat: support order module -> main
    let files;
    // feat: set main first
    files = [packagejson.main, packagejson.module];
    // feat: set module first\nwhen packagejson.type == "module"
    if (packagejson.type == "module") {
        files = [packagejson.module, packagejson.main];
    }
    // feat: support order module -> main -> jsnext -> browser
    // files=getIndexByOrder(packagejson,"module -> main")
    // files = getIndexByOrder(packagejson,"module -> main -> jsnext -> browser");
    files = [...files, ...getIndexByOrder(packagejson, "jsnext -> browser")];

    files = files.filter((v) => v);
    if (!endswithsep) {
        files = files.map((v) => `/${v}`);
    }
    // step-x-e: get index in packagejson

    return files;

    /**
     * get index file with order - get packagejson key val
     * @param {{string}} packagejson
     * @param {string} order
     * @param {regexp} sepreg order sep reg
     * @returns
     */
    function getIndexByOrder(
        packagejson,
        order = "module -> main",
        sepreg = / ?-> ?/
    ) {
        return order
            .split(sepreg)
            .filter((v) => v)
            .map((v) => packagejson[v])
            .filter((v) => v);
    }
}

/**@typedef {{format:string,source:string,shortCircuit:boolean}} loaderResult */
/**
 * custom load handle for esm loader
 * @param {string} url
 * @param {*} context
 * @param {*} defaultLoad
 * @returns {Promise<loaderResult>}
 * @desciption
 * ```
 * ## task
 * - [x] import .css,html,svg file as an esm module
 * ## idea
 * - [x] run custom loader
 * - [x] run defalut loader
 * ```
 */
export async function load(url, context, defaultLoad) {
    const checkUrl = url.split("?")[0]; // Cutting the possible search parameters
    // console.log(parsePath(checkUrl));
    // let ext = extname(checkUrl);
    // if (!ext) {
    //     checkUrl = `${checkUrl}.js`;
    // }

    // feat: run custom load
    // feat: wrap text file esm module
    const txtExt = [".md", ".css", ".html", ".htm", ".svg"];
    if (txtExt.some((ext) => checkUrl.endsWith(ext))) {
        // console.log(url);
        return await wrapTextFileToEsmModule(url);
    }
    // if (!ext) {
    //     return defaultLoad(checkUrl, context, defaultLoad);
    // }

    // feat: run default load
    return defaultLoad(url, context, defaultLoad);
}
// https://foxeyes.github.io/cv/pulse/custom_node_esm_loader.html

/**
 * wrap text file to es module
 * @param {string} url
 * @returns {{format:string,source:string,shortCircuit:boolean}}
 * @description
 * ```
 * ## idea
 * read-file-text -> wrap-esm-expression -> set-module-format
 * ```
 */
async function wrapTextFileToEsmModule(url) {
    // console.log(new URL(url));
    // idea: read-file-text -> wrap-esm-expression -> set-module-format
    const content = await readFile(new URL(url));
    return {
        format: "module",
        source: `export default ${JSON.stringify(content.toString())};`,
        shortCircuit: true,
    };
}

/**
 * get package.json module type from extension
 * @param {string} filePath
 * @returns {string} - 'module' or 'commonjs'
 */
function getFormatFromExtension(filePath) {
    const extension = extname(filePath);
    if (extension === ".mjs" || extension === ".mts") {
        return "module";
    }
    if (extension === ".cjs" || extension === ".cts") {
        return "commonjs";
    }
}

// idea:
// to use as below:
// 1.1
// import html from './index.html';
// import css from './styles.css';
// import svg from './image.svg';

// 1.2
// node --loader ./loader.js ./my-app.js
// node scr/lib/esm-loader.js
