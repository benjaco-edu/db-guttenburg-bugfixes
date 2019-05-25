let fs = require("fs");
const readCity = require('../common/readCity');

let mysqlImporter = require("./mysqlImporter");
//let mongoDbImporter = require("./mongoDbImporter");

let booksAndCities = JSON.parse(fs.readFileSync("../booksAndCities.json"))

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
                    id,
                    part: book.Part,
                    title: book.Title,
                    author: book.Authorname
                }
            }),
        relations: Object.entries(booksAndCities)
            .map(([bookId, book]) => {
                return book.cities.map(city => {
                    return {
                        bookpartsId: bookId, 
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