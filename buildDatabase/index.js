let fs = require("fs");
const readCity = require('../common/readCity');

let mysqlImporter = require("./mysqlImporter");
let mongoDbImporter = require("./mongoDbImporter");

Object.filter = function( obj, predicate) {
    var result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

let booksAndCities = JSON.parse(fs.readFileSync("booksAndCitiesComplete.json"))
delete booksAndCities["13655.txt.20041109"]
let noWithErrors = booksAndCities.length;
booksAndCities = Object.filter(booksAndCities, i => typeof i.error === "undefined" )
console.log(noWithErrors - booksAndCities.length, "was removed because those where flagged with errors")

//"9768.txt":{"error":"Error","cities":[{"index":3936,"cityIndex":"21399"}

// [item.id, item.name, `POINT(${item.lat}, ${item.lon})`, item.population, item.timezone])
async function insertIntoMysql(cities){
    await mysqlImporter({
        cities: Object.entries(cities)
            .map(([id, city]) => {
                return {
                    id,
                    ...city
                }
            }),
        bookParts: Object.entries(booksAndCities)
            .map(([id, book]) => {
                return {
                    id: parseInt(id.replace(".txt", "")),
                    part: book.Part,
                    title: (book.Title === undefined ? '' : book.Title.substring(0, 249)) ,
                    author: (book.Authorname === undefined ? '' : book.Authorname.substring(0, 199))
                }
            }),
        relations: Object.entries(booksAndCities)
            .map(([bookId, book]) => {
                return book.cities.map(city => {
                    return {
                        bookpartsId: parseInt(bookId.replace(".txt", "")), 
                        locationId: parseInt(city.cityIndex), 
                        indexInBook: city.index
                    }
                })
            })
            .flat()
    })
}

async function insertIntoMongo(){
    await mongoDbImporter()
}


(async ()=>{
    let { objects: cities } = await readCity("cities15000.txt");


    console.log("----- Generating mysql statements -----")
    await insertIntoMysql(cities);
    console.log("----- Inserting into mongo db -----")
    await insertIntoMongo();
    

    process.exit();
})()