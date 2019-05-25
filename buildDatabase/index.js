let fs = require("fs");
const readCity = require('../common/readCity');

let mysqlImporter = require("./mysqlImporter");
//let mongoDbImporter = require("./mongoDbImporter");

Object.filter = function( obj, predicate) {
    var result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};

let booksAndCities = JSON.parse(fs.readFileSync("../booksAndCities.json"))
delete booksAndCities["13655.txt.20041109"]
booksAndCities = Object.filter(booksAndCities, i => typeof i.error === "undefined" )

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

}


(async ()=>{
    let { objects: cities } = await readCity("cities15000.txt");


    await insertIntoMysql(cities);
    await insertIntoMongo();
    

    process.exit();
})()