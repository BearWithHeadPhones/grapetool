const { Worker, isMainThread, parentPort, workerData, SharedA } = require('worker_threads')

let productionPath = __dirname + "/../parallelComputing.js"
let devpath = "./extraResources/parallelComputing.js"
if (isMainThread) {
    function runService(content, tokens, cpus) {

        const chunksize = content.length / cpus
        chunks = []
        for (let i = 0; i < content.length; i += chunksize) {
            chunks.push(content.slice(i, i + chunksize));
        }

        return new Promise((resolve, reject) => {
            let workers = chunks.map(content => { return new Worker(devpath, { workerData: { content: content, tokens: tokens } }) });

            results = []
            return Promise.all(workers.map(element => {
                return new Promise((resolve, reject) => {
                    element.on("message", result => {
                        results = [...results, ...result]
                        resolve()
                    })
                })
            })).then(() => {
                resolve(results)
            })

        })
    }
} else {
    parentPort.postMessage(calculate(workerData.content, workerData.tokens));
}

function calculate(content, tokens, index) {
    bookmarks = []
    content.forEach((element) => {
        tokens.some((token) => {
            if (token.regexp) {
                var tokenRegexp = new RegExp(token.regexp);
                if (element.line.search(token.phrase) > -1) {
                    let regexpResult = element.line.match(tokenRegexp);
                    if (regexpResult) {
                        bookmarks.push({
                            id: element.index,
                            text: element.line,
                            name: token.name + regexpResult[1],
                            emot: token.emot
                        }
                        );
                        return true;
                    }
                }
            } else if (element.line.search(token.phrase) > -1) {
                bookmarks.push({
                    id: element.index,
                    text: element.line,
                    name: token.name,
                    emot: token.emot
                });
                return true;
            }
            return false;
        });
    });
    console.log(bookmarks)
    return bookmarks;
}

module.exports = {
    runService
};