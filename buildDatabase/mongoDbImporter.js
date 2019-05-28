let MongoClient = require('mongodb').MongoClient;
let DbName = "greenbugDb"
var url = "mongodb://localhost:27017/" + DbName;

Object.filter = function( obj, predicate) {
    var result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};


function getAllBookObjects(file) {
    return Object.entries(file).map(x => {
        return {
            'id': parseInt(x[0].replace(".txt", "")),
            'title': x[1].Title,
            'author': x[1].Authorname,
            'part': x[1].Part,
            'locations': x[1].cities.map(c => {
                return {
                    'indexInBook': parseInt(c.index),
                    'locationRef': parseInt(c.cityIndex)
                }
            })
        }
    })
}

function getAllLocationObjects(cities, locationToBookRefs) {
    return Object.entries(cities).map(x => {
        return {
            'id': parseInt(x[0]),
            'name': x[1].name,
            'population': parseInt(x[1].population),
            'tz': x[1].tz,
            'coordinate': { type: "Point", coordinates: [parseFloat(x[1].lng), parseFloat(x[1].lat)] },
            'booksRef': (() => {
                if (locationToBookRefs[x[0]] === undefined)
                    return []
                return locationToBookRefs[x[0]]
            })()
        }
    })
}


module.exports = async function (cities, booksAndCities) {
    let locationToBookRefs = Object.entries(booksAndCities)
        .map(([index, item]) => {
            return item.cities.map(city => [index, city.cityIndex])
        })
        .flat()
        .reduce((acc, [file, city]) => {
            file = parseInt(file.replace(".txt", ""))
            if (acc[city] === undefined) acc[city] = []
            if (!acc[city].includes(file)) acc[city].push(file)
            return acc;
        }, {})

    let db = await MongoClient.connect(url);
    var dbo = db.db(DbName);
    console.log("connected");


    await dbo.createCollection("Locations");
    await dbo.collection("Locations").insertMany(getAllLocationObjects(cities, locationToBookRefs))
    console.log("locations done..");

    await dbo.createCollection("Books");
    await dbo.collection("Books").insertMany(getAllBookObjects(booksAndCities))

    console.log("Done")

}
