const rp = require('request-promise');  
const cheerio = require('cheerio');  
const fs = require('fs');
let file = fs.readFileSync("scrapes.txt").toString().split("\n");
const _cliProgress = require('cli-progress');

let results = JSON.parse(fs.readFileSync("result", "utf8").toString())

let bar = new _cliProgress.Bar({}, _cliProgress.Presets.shades_classic);


(async ()=>{

    let no = 0;
    bar.start(file.length, 0)

    for(let id of file){
        for(let tryn = 0; tryn < 5  && results[id] === undefined; tryn++){

            await new Promise(r => setTimeout(r, 2000))

            try {
                const html = await rp("https://www.gutenberg.org/ebooks/" + id.replace(".txt", ""));
                const title = cheerio('h1', html).text()

                results[id] = title;
                fs.writeFileSync("result", JSON.stringify(results, null, 2))

                
                break;
            } catch (error) {
                results[id] = error.toString();
            }


        } 

        no++
        bar.update(no)
    }

    fs.writeFileSync("result", JSON.stringify(results, null, 2))

    bar.stop();

    process.exit();
})()
