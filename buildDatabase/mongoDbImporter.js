let MongoClient = require('mongodb').MongoClient;
let DbName = "greenbugDb"
var url = "mongodb://localhost:27017/"+DbName;

//mongo port : 27017

/*
Object.entries(a).map( ([filename, book]) => {
	return {
        author :  book.Authorname,
        part : book.Part,
        title : book.Title,
        ref  : filename.replace(".txt",""),
        locations: book.cities.map(item => {
			return {
				locationRef: parseInt(item.cityIndex), 
				indexInBook: item.index
			}
        })
    }
})
*/


  
//   var myobj =    [
//                  { name: "Company Inc", address: "Highway 37" },
//                  { name: "Company Inc", address: "Highway 38" }
//                  ];
//   dbo.collection("customers").insertMany(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
 

//indlæser hele filen med det store obj
// det første objekt trukket ud

/*
name        //
coordinate  //HC 1,1
ref(id)
population  //HC 1000
timezone    //HC 0.0
continent   //HC 
[booksRef]  // key - ".txt"
*/


/*
BookCollection
author < books and cities
part < books and cities
title < books and cities
Ref  < books and cities
locOBJ : [{locationref(id), indexInBook},...] : null

*/

/*
 * books . insert 
 *      id 1111.txt
 *      locations :  [#berlin, #cph]
 * 
 * 
 * locations.insert
 *      id: 5432 < from csv
 * 
 *      books: null < insert in next query
 *      name: "Copenhagen" < from csv 
 *      booksRef: null
 * 
 * 
*/

let fs = require("fs")
let file = JSON.parse(fs.readFileSync('../booksAndCities.json'))
const readCity = require('../common/readCity');



function getAllBookObjects(file){
    return Object.entries(file).map(x => {
        return {
            'author' : x[1].Authorname,
            'part' : x[1].Part,
            'title' : x[1].Title,
            'ref': parseInt(x[0].replace(".txt","")), 
            'locations' : x[1].cities.map(c=>{
                return{
                    'indexInBook': c.index,
                    'locationRef' : parseInt(c.cityIndex)
                }
            })
        }
    })
}

function getAllLocationObjects(cities, locationToBookRefs){
    return Object.entries(cities).map(x=> {
        return {
            'id' : x[0],
            'name' : x[1].name,
            'population' : x[1].population,
            'tz' : x[1].tz,
            'coordinate' : { type: "Point", coordinates: [ x[1].lng, x[1].lat ] },
            'booksRef' : (()=>{
                if (locationToBookRefs[x[0]] === undefined)
                    return []
                return locationToBookRefs[x[0]]
            })()            
        }
    })
}

let booksAndCities = JSON.parse(fs.readFileSync("../booksAndCities.json"))


async function main(){


    let cities = (await readCity("cities15000.txt")).objects;

    console.log(
        Math.max(   ...Object.keys(booksAndCities).map(i => parseInt(i.replace(".txt","")))     )
        )
    return

    let locationToBookRefs = Object.entries(booksAndCities)
        .map( ([index, item]) => {
            return item.cities.map(city => [index, city.cityIndex] )
        })
        .flat()
        .reduce((acc, [file, city])=> {
            file = parseInt(file.replace(".txt", ""))
            if(acc[city] === undefined) acc[city] = []
            if(!acc[city].includes(file)) acc[city].push(file)
            return acc;
        }, {})

    let db = await MongoClient.connect(url);
    var dbo = db.db(DbName);
console.log("connected");


    await dbo.createCollection("Locations");
    await dbo.collection("Locations").insertMany(getAllLocationObjects(cities, locationToBookRefs))
console.log("locations done..");

    await dbo.createCollection("Books");
    await dbo.collection("Books").insertMany(getAllBookObjects(file))

    console.log("Done")
    
}


main();



/*
class mongoDBImporter{

    async init(){
    }
    async createDatabase(){
    }

    // arr of {id, name, lat, lon, population, timezone, continent}
    async insertCity(arr){
    }

    // arr of {id, title, part, author}
    async insertBookpart(arr){
    }

    // arr of {bookpartsId, locationId, indexInBook}
    async insertBookLocation(arr){
    }
}
module.exports = mongoDBImporter;
*/