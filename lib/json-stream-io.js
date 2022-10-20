import { createReadStream, createWriteStream } from "fs";
import { readStream, writeStream } from "./stream-io.js";
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
const jsonstream = new JsonStream()
export {JsonStream,jsonstream}