#!/usr/bin/env node

import { createReadStream, createWriteStream } from "fs";

const { log } = console;
async function main() {
    const jsonstream = new JsonStream();
    const textstream = new TextFileIO();

    let fileopt = {
        dataLoc: `stars-list-shim.all.json`,
        readmeLoc: `README.md`,
    };
    let allstars;
    log(`[info] load data`);
    jsonstream.init(`${fileopt.dataLoc}`);
    allstars = await jsonstream.read([]);

    function getTableBody(item) {
        let { full_name, description, languages } = item;

        // if(language==language) language='unknow'
        let res = `|[${full_name}](https://github.com/${full_name})|${description}|`;
        return res;
    }
    function table(title, body) {
        let res = `
## ${title}
repo|description|
:----|:----|
${body}
`;
        return res;
    }

    function getTabBody(item) {
        let { full_name, description, languages } = item;

        // if(language==language) language='unknow'
        let res = `- [${full_name}](https://github.com/${full_name}) - ${description}\n`;
        return res;
    }
    function tab(title, body) {
        let res = `
## ${title}
${body}
`;
        return res;
    }

    let style;
    style='tab'
    log(`[task] make readme table`);
    let allLanguages = allstars.map((item) => item.languages);
    log(`[info] delete dup language before to readme table`);
    allLanguages = [...new Set(allLanguages)];
    allstars = allLanguages
        .map((language) => {
            let part;
            part = allstars
                .filter((v) => {
                    return v.languages == language;
                })
                .map((item) => {
                    switch (style) {
                        case "tab":
                            return getTabBody(item);
                            break;

                        default:
                            return getTableBody(item);
                            break;
                    }
                })
                .join(`\n`);

            switch (style) {
                case "tab":
                    return tab(language, part);
                default:
                    return table(language, part);
            }
            // return table(language, part);
        })
        .join("\n\n");
    allstars = allstars.trim();
    // log(allstars)

    textstream.init(`template/readme.head.md`);
    let front = await textstream.read("");
    if (front) {
        allstars = `${front}\n\n${allstars}`;
    }

    textstream.init(`README.md`);
    await textstream.write(allstars);
    log(`[info] out: README.md`);
}

// @ymc/streamio
function readStream(stream) {
    return new Promise((resolve, reject) => {
        let data = "";
        stream
            .on("data", (chunk) => {
                data += chunk.toString();
            })
            .on("end", () => {
                resolve(data);
            })
            .on("error", reject);
    });
}
function writeStream({ stream, data }) {
    return new Promise((resolve, reject) => {
        // write
        stream.write(data, "utf-8");
        // fire end
        stream.end();
        // desc-x-s: handle event finish and err
        stream
            .on("finish", () => {
                resolve(data);
            })
            .on("error", reject);
        // desc-x-e: handle event finish and err
    });
}
// @ymc/text-streamio
/**
 * @sample
 * ```
 * txtfileio.file.name="CHANGELO.md"
 * //or
 * txtfileio.init("CHANGELO.md")
 * await txtfileio.read()
 * txtfileio.option.writemode='overide'
 * await txtfileio.write('')
 * ```
 */
class TextFileIO {
    constructor(name = "CHANGELO.md") {
        this.init(name);
    }

    /**
     * read file async (stream mode)
     * @param {string|undefined} def
     * @returns {Prmosie<string>}
     */
    async read(def = "") {
        const { file } = this;
        let reader;
        let res;
        try {
            reader = createReadStream(file.name);
            res = await readStream(reader);
        } catch (error) {
            res = def;
        }
        file.data = res;
        return res;
    }

    /**
     * write file async (stream mode)
     * @param {string} data
     * @returns {Prmosie<void>}
     */
    async write(data) {
        const { file, option } = this;
        let writer;
        let old;
        writer = createWriteStream(file.name);
        old = file.data;
        // insert-head?append?override?
        // let writemode = "override";
        switch (option.writemode) {
            case "override":
                data = `${data}`;
                break;
            // case "head":
            //   data = `${data}\n${old}`;
            //   break;
            case "append":
                data = `${old}\n${data}`;
                break;
            // case "override":
            //   data = `${data}`;
            case "head":
                data = `${data}\n${old}`;
            default:
                break;
        }
        file.data = data;
        await writeStream({ stream: writer, data });
    }

    /**
     *
     * @param {string} name
     * @param {string} data
     * @returns {this}
     */
    init(name = "CHANGELO.md", data = "") {
        this.file = {
            name,
            data,
        };
        this.option = {};
        return this;
    }

    /**
     * ceate a new instance
     * @param  {...any} option
     * @returns
     */
    new(...option) {
        return new TextFileIO(...option);
    }
}

// @ymc/json-streamio
/**
 * @sample
 * ```
 * jsonstream.file.name="package.json"
 * //or
 * jsonstream.init("package.json")
 * await jsonstream.read()
 * await jsonstream.write({})
 * ```
 */
class JsonStream {
    constructor(name, data) {
        this.init(name, data);
    }

    /**
     * read file async (stream mode)
     * @param {{}|[]} def
     * @returns {Prmosie<json>}
     */
    async read(def = {}) {
        const { file } = this;
        let reader;
        let res;
        try {
            reader = createReadStream(file.name);
            res = await readStream(reader);
            res = JSON.parse(res);
        } catch (error) {
            // console.log(error);
            res = def;
        }
        file.data = res;
        return res;
    }

    /**
     * write file async (stream mode)
     * @param {{}|[]|undefined} data
     * @returns {Prmosie<void>}
     */
    async write(data) {
        const { file, option } = this;
        let writer;
        try {
            writer = createWriteStream(file.name);
            if (data) {
                file.data = data;
            } else {
                data = file.data;
            }
            await writeStream({
                stream: writer,
                data: JSON.stringify(data, null, 2),
            });
        } catch (error) {}
    }

    init(name = "package.json", data = {}) {
        this.file = {
            name,
            data,
        };
        this.option = {};
    }

    new(...option) {
        return new JsonStream(...option);
    }
}

function renderTpl(tpl = "", menifest) {
    let res = tpl;
    let name;
    let suffix;
    Object.keys(menifest).forEach((key) => {
        const value = menifest[key];
        res = res.replace(new RegExp(`{${key}}`, "ig"), value);
    });
    return res;
}
/**
 *
 * @param {string} tpl
 * @param {{}} data
 * @returns {string|function({}):string}
 * @sample
 * ```
 * writeTpl('{method} repo/owner',{method:'POST'}) //POST repo/owner
 * ```
 */
function writeTpl(tpl, data) {
    if (data) {
        return renderTpl(tpl, data);
    }
    return (v) => renderTpl(tpl, v);
}

main();
// bin/render-readme.js
