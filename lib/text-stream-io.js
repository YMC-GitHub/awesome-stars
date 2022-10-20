import { createReadStream, createWriteStream } from "fs";
import { readStream, writeStream } from "./stream-io.js";
/**
 * @sample
 * ```
 * textstream.file.name="CHANGELO.md"
 * //or
 * textstream.init("CHANGELO.md")
 * await textstream.read()
 * textstream.option.writemode='overide'
 * await textstream.write('')
 * ```
 */
 class TextStream {
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
        return new TextStream(...option);
    }
}
const textstream =new TextStream()
export {TextStream,textstream}