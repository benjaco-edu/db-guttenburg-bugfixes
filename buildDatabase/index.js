var FlexSearch = require("flexsearch");
const fs = require('fs');
const fastCsv = require('fast-csv');


function chunks(arr, size) {
    let output = [];
    for (let i = 0; i < arr.length; i += size) {
        output.push(arr.slice(i, i + size));
    }
    return output;
}

let allFiles = fs.readdirSync('./zipfiles/');
let fileChunks = chunks(allFiles, 200);


function getCityNames(filename) {
    let names = [];
    return new Promise(resolve => {
        const stream = fs.createReadStream(filename);

        const csvStream = fastCsv({delimiter: '\t'})
            .on("data", function(data){
                names.push(data[2]);
            })
            .on("end", function(){
                resolve(names);
            });

        stream.pipe(csvStream);
    })
}

(async () => {

    let cityNames = await getCityNames("cities15000.txt");


    for(let files of fileChunks){
        var index = new FlexSearch({async: true, worker: true});

        for (let file of files) {
            let fileContent = fs.readFileSync("./zipfiles/"+file, 'utf8');
            index.add(file, fileContent)
        }


        for (let cityName of cityNames) {
            let locations = await index.search(cityName);

            console.log(cityName+" in "+locations)
        }
    }
})();


