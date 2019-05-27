let largeFiles = [
    /*"11615.txt",
    "11275.txt",
    "12030.txt",
    "1581.txt",
    "19218.txt",
    "200.txt",
    "27348.txt",
    "27509.txt",
    "27560.txt",
    "27558.txt",
    "27559.txt",
    "27638.txt",
    "29233.txt",
    "2981.txt",
    "3200.txt",
    "3136.txt",
    "3254.txt",
    "3252.txt",
    "3400.txt",
    "35830.txt",
    "35829.txt",
    "3900.txt",
    "4000.txt",
    "4200.txt",
    "44562.txt",
    "4500.txt",
    "44621.txt",
    "4656.txt",
    "48768.txt",
    "4900.txt",
    "5050.txt",
    "5400.txt",
    "5600.txt",
    "6049.txt",
    "6300.txt",
    "6800.txt",*/
]
let wiredNames = [   
    // ["batlf10.txt",	"60005.txt"],

/*


    ["ajtl10.txt",	"60000.txt"],
    ["allyr10.txt",	"60001.txt"],
    ["alpsn10.txt",	"60002.txt"],
    ["balen10.txt",	"60003.txt"],
    ["baleng2.txt",	"60004.txt"],
    ["bgopr10.txt",	"60006.txt"],
    ["brnte10.txt",	"60007.txt"],
    ["bstjg10.txt",	"60008.txt"],
    ["cambp10.txt",	"60009.txt"],
    ["canbe10.txt",	"60010.txt"],
    ["cantp10.txt",	"60011.txt"],
    ["cfrz10.txt",	"60012.txt"],
    ["crsnk10.txt",	"60013.txt"],
    ["esbio10.txt",	"60014.txt"],
    ["grybr10.txt",	"60015.txt"],
    ["mklmt10.txt",	"60016.txt"],
    ["morem10.txt",	"60017.txt"],
    ["mspcd10.txt",	"60018.txt"],
    ["penbr10.txt",	"60019.txt"],
    ["pgjr10.txt",	"60020.txt"],
    ["pntvw10.txt",	"60021.txt"],
    ["prcpg10.txt",	"60022.txt"],
    ["prhg10.txt",	"60023.txt"],
    ["prhsb10.txt",	"60024.txt"],
    ["rlsl110.txt",	"60025.txt"],
    ["rlsl210.txt",	"60026.txt"],
    ["rmlav10.txt",	"60027.txt"],
    ["sesli10.txt",	"60028.txt"],
    ["svyrd10.txt",	"60029.txt"],
    ["tecom10.txt",	"60030.txt"],
    ["utrkj10.txt",	"60031.txt"],
    ["vpasm10.txt",	"60032.txt"],
    ["wldsp10.txt",	"60033.txt"],
    ["wtrbs10.txt",	"60034.txt"],
    ["zncli10.txt",	"60035.txt"],
    ["12hgp10a.txt", "60036.txt"],*/
]


const fs = require('fs');
const readCity = require('../common/readCity');
const locationsFromText = require('./locactionsFromText');
const extractors = require('./extract');


let removeUnknown = (cityNames, bookLocations) => {
    let cleaned = [];

    for (let bookLocation of bookLocations) {
        let id = cityNames[bookLocation[1]]
        if (typeof id !== "undefined") {
            cleaned.push({
                index: bookLocation[0],
                cityIndex: id
            })
        }
    }

    return cleaned;
}


(async () => {
    let file = JSON.parse(fs.readFileSync("booksAndCities.json").toString())

    console.log(Object.keys(file).length)

    process.exit();

    let bookAndCities = file;
    let { names: cities } = await readCity("cities15000.txt");

    async function extract(filename, newfilename){
        let fileContent = fs.readFileSync("../guttenberg-data/zipfiles/"+filename).toString();
        fileContent = extractors.removeFooter(fileContent);
        fs.writeFileSync("zipfiles/"+newfilename, fileContent)

        try {
            let bookLocation = removeUnknown(cities, await locationsFromText(filename));


            try {
                let smalltext = extractors.take25lines(fileContent)

                let Part = extractors.extractPart(smalltext);
                bookAndCities[newfilename] = {
                    Part,
                    Authorname: extractors.extractAuthorName(smalltext),
                    Title: extractors.extractTitle(smalltext, Part),
                    cities: bookLocation
                };
            } catch (error) {
                bookAndCities[newfilename] = {
                    error: "Error",
                    cities: bookLocation
                };
            }

        } catch (e) {
            console.log(filename, "failed", e)
        }
        console.log(".")
        
    }

    for(let file of largeFiles){
        await extract(file, file)
    }

    for(let [filename, newname] of wiredNames){
        await extract(filename, newname)
    }

    fs.writeFileSync('booksAndCities.json', JSON.stringify(bookAndCities), 'utf8');



    process.exit();
})();


