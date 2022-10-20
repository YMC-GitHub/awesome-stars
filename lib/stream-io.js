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
export {readStream,writeStream}