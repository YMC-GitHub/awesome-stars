#!/usr/bin/env node

import formatDate from "../lib/format-date.js";
import { JsonStream } from "../lib/json-stream-io.js";
import { TextStream } from "../lib/text-stream-io.js";
import { writeTpl } from "../lib/render-tpl.js";

const { log } = console;
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
function getTableBody(item, option = {}) {
    let { full_name, description, languages } = item;

    let res;
    // res = `|[${full_name}](https://github.com/${full_name})|${description}|`;
    let headTpl;
    res = `[{full_name}](https://github.com/{full_name})|{description}`;
    if (
        option.useStarredTime &&
        (!option.topicBy || option.topicBy !== "yearmonth")
    ) {
        res = `${res}|{starred_at}`;
    }
    if (option.topicBy == "yearmonth") {
        res = `${res}|{languages}`;
    }
    res = writeTpl(res, item);

    return res;
}
function getTableHeader(option) {
    let res;
    let head = `repo,description`;
    if (
        option.useStarredTime &&
        (!option.topicBy || option.topicBy !== "yearmonth")
    ) {
        head = `${head},starred_at`;
    }

    if (option.topicBy == "yearmonth") {
        head = `${head},language`;
    }

    head = head.replace(/,/gi, "|");
    res = [
        head,
        head
            .split("|")
            .map((v) => ":--")
            .join("|"),
    ].join("\n");
    // log(res)
    return res;
}

function table(title, body, head) {
    //[md:set table collum width](https://github.com/markedjs/marked/issues/266)
    //https://9to5answer.com/set-table-column-width-via-markdown
    let res = `
## ${title}
${head}
${body}
`;
    return res;
}

function getTabBody(item, option = {}) {
    let { full_name, description, languages, starred_at } = item;

    let res;
    // res= `- [${full_name}](https://github.com/${full_name}) - ${description}\n`;
    res = `-`;
    if (
        option.useStarredTime &&
        (!option.topicBy || option.topicBy !== "yearmonth")
    ) {
        res = writeTpl(`${res} {starred_at}`, item);
    }
    if (option.topicBy == "yearmonth") {
        res = `${res} {languages}`;
    }

    res = writeTpl(
        `${res} [{full_name}](https://github.com/{full_name}) - {description}`,
        item
    );
    res = `${res}\n`;
    return res;
}
function tab(title, body) {
    let res = `
## ${title}
${body}
`;
    return res;
}

function setTableStyle(content, option) {
    let tablestyle = `
<style>
table{
    display:table;
    width:100%;
}
table th:nth-of-type(1),table th:nth-of-type(3) {
    width:10%;
}
</style>
`;

    // if (!option.style) content = `${tablestyle}\n\n${content}`;
    content = `${tablestyle}\n\n${content}`;
    return content;
}

function render(allstars, option = {}) {
    let res;
    //
    let topicBy = option.topicBy;
    if (!topicBy) topicBy = "languages";
    let allLanguages = allstars.map((item) => item[topicBy]);
    log(`[info] delete dup topic before to render it`);
    allLanguages = [...new Set(allLanguages)];

    if (topicBy == "yearmonth") {
        log(`[info] sort title time`);
        allLanguages = allLanguages.sort((a, b) => {
            // log(b - a)//NaN
            // log(new Date(b)- new Date(a))
            return new Date(b) - new Date(a);
        });
    }
    // log(allLanguages);

    res = allLanguages
        .map((language) => {
            let part;
            part = allstars
                .filter((v) => {
                    return v[topicBy] == language;
                })
                .map((item) => {
                    switch (option.style) {
                        case "tab":
                            return getTabBody(item, option);
                            break;

                        default:
                            return getTableBody(item, option);
                            break;
                    }
                })
                .join(`\n`);

            // if (!language) language = "unknow";
            switch (option.style) {
                case "tab":
                    return tab(language, part);
                default:
                    return table(language, part, getTableHeader(option));
            }
            // return table(language, part);
        })
        .join("\n\n");

    let tableOfContent = "";
    if (option.useTableOfContent) {
        // get tableofcontent
        tableOfContent = allLanguages.map((v) => `*  [${v}](#${v})`).join("\n");
        if (tableOfContent) {
            tableOfContent = `## table of content\n\n${tableOfContent}`;
        }
    }
    if (tableOfContent) {
        // wrap tableofcontent
        res = `${tableOfContent}\n\n${res}`;
    }

    return res;
}

async function main() {
    const jsonstream = new JsonStream();
    const textstream = new TextStream();

    let fileopt = {
        dataLoc: `stars-list-shim.all.json`,
        readmeLoc: `stars-list-table.md.md`,
    };
    let allstars;
    log(`[info] load data`);
    jsonstream.init(`${fileopt.dataLoc}`);
    allstars = await jsonstream.read([]);

    log(`[info] sort allstars by starrd time`);
    if (allstars[0].starred_at) {
        allstars = allstars.sort((a, b) => {
            // log(b.starred_at - a.starred_at)//NaN
            return new Date(b.starred_at) - new Date(a.starred_at);
        });
    }

    allstars = allstars.map((item) => {
        let { languages } = item;
        if (!languages) item.languages = "Unknow";
        return item;
    });

    log(`[info] format starrd time`);
    // "yyyy-MM-dd HH:mm:ss"
    allstars = allstars.map((item) => {
        let { starred_at } = item;
        if (starred_at) {
            item.starred_at = formatDate("yyyy-MM-dd", new Date(starred_at));
            item.yearmonth = formatDate("yyyy-MM", new Date(starred_at));
        } else {
            item.starred_at = "";
            item.yearmonth = "";
        }
        return item;
    });

    let style;
    // style = "tab";
    // log(`[task] make readme table`);
    log(`[task] render allstars to markdown`);
    let renderOption = {
        style: "tab", //tab
        useStarredTime: true,
        topicBy: "", //yearmonth
        useTableOfContent: true,
    };

    let content = render(allstars, renderOption);
    content = content.trim();

    if (!renderOption.style) {
        content = setTableStyle(content);
    }

    // log(content)

    log(`[task] add front content`);
    let now = formatDate(
        "yyyy-MM-dd HH:mm:ss",
        getTimeOfTimeZone(new Date(), "Asia/Shanghai")
    );

    textstream.init(`template/readme.head.md`);
    let front = await textstream.read("");
    if (front) {
        front = front.replace("{time}", now);
        content = `${front}\n\n${content}`;
    }

    textstream.init(`stars-list-table.md.md`);
    await textstream.write(content);
    log(`[info] out: stars-list-table.md.md`);
}

// @ymc/streamio
// touch lib/stream-io.js
// @ymc/text-stream-io
// touch lib/text-stream-io.js
// @ymc/json-stream-io
// @ymc/render-tpl

main();
// bin/render-readme.js
