const fs = require('fs');
const readCity = require('./readCity');
const locationsFromText = require('./locactionsFromText');
const extractors = require('./extract');

let allFiles = fs.readdirSync('./zipfiles/');
let bookAndCities = {};

function chunks(arr, size) {
    let output = [];
    for (let i = 0; i < arr.length; i += size) {
      output.push(arr.slice(i, i + size));
    }
    return output;
}

let partitions = chunks(allFiles, 4)

let removeUnknown = (cityNames, bookLocations) => {
    let cleaned = [];

    for(let bookLocation of bookLocations){
        let id = cityNames[bookLocation[1]]
        if(typeof id !== "undefined"){
            cleaned.push({
                index: bookLocation[0],
                cityIndex: id
            })
        }
    }

    return cleaned;
}


(async () => {
    let {names: cities} = await readCity("cities15000.txt");

    for (let partition of partitions) {

        let partCities = await Promise.all(
            partition.map(async filename =>  {
                let bookLocations = await locationsFromText(filename);

                let cleanedCities = removeUnknown(cities, bookLocations);
                
                let fileContent = await new Promise(
                    resolve => fs.readFile(__dirname + '/../zipfiles/'+filename, function(err,data){
                        resolve(data.toString());
                    })
                )
                let Part = extractors.extractPart(fileContent);
                let Authorname = extractors.extractAuthorName(fileContent);
                let Title = extractors.extractTitle(fileContent,Part);

                return [filename, cleanedCities, Authorname, Title, Part];
            })
        )

        for(let [filename, ...bookinfo] of partCities){
            bookAndCities[filename] = bookinfo;
        }

        console.log(Object.keys(bookAndCities).length)
        console.log(JSON.stringify(partCities, null, 2))

        fs.writeFileSync('./booksAndCities.json', JSON.stringify(bookAndCities), 'utf8');

    }

})();


