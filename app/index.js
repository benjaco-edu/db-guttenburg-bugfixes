let express = require("express");
let app = express();
let DbName = "greenbugDb"
const mysql = require('mysql2');
let MongoClient = require('mongodb').MongoClient;
 
var url = "mongodb://home.regon.dk:27017/" + DbName;
// create the connection to database
const connection = mysql.createConnection({
  host: 'home.regon.dk',
  user: 'nodejs',
  password: 'nodecode',
  database: 'greenbugDb'
});

var db;
// connect to mongoDb
MongoClient.connect(url, function(err, con) {
    db = con.db(DbName);
});
 


let queries = {
    mongo: [
        [
            "Locations",
            name => {
                return [
                    {$match:{name:name}},
                    {$limit:1},
                    {$unwind:"$booksRef"},
                    {$project:{Ref:"$booksRef", coords: "$coordinate"}},
                    {$lookup:{ from: "Books", localField: "Ref", foreignField: "id", as: "Result"}},
                    {$project:{            
                        author:{$arrayElemAt:["$Result.author",0]},             
                        title:{$arrayElemAt:["$Result.title",0]}, 
                        id:{$arrayElemAt:["$Result.id",0] }
                    }}
                ]
            }
        ],
        [
            "Books",
            title => {
                return [
                    {$match:{"title":title}},
                    {$unwind:"$locations"},
                    {$project:{locRef:"$locations.locationRef"}},
                    {$lookup:{from: "Locations", localField: "locRef" , foreignField: "id" , as: "locationsInBook"}}, 
                    {$project:{
                        locationName:{$arrayElemAt:["$locationsInBook.name",0]}, 
                        coords:{$arrayElemAt:["$locationsInBook.coordinate",0]}
                    }} 
                ]
            }
            
        ],
        [
            "Books",
            author => {
                return [
                    {$match:{"author":author}},
                    {$unwind:"$locations"},
                    {$project:{title:"$title", locRef:"$locations.locationRef"}},
                    {$lookup:{from: "Locations", localField: "locRef" , foreignField: "id" , as: "locationsInBook"}},
                    {$project: {
                        title: "$title",
                        locationName:{$arrayElemAt:["$locationsInBook.name",0]},
                        coords:{$arrayElemAt: ["$locationsInBook.coordinate",0]}
                    }} 
                ]
            }
        ],
        [
            "Locations",
            coords => { // coords is a 2 element array
                return [
                    {$geoNear: {
                         near: { type: "Point", coordinates: coords},
                         distanceField: "distance",
                         maxDistance: 200*1000,
                         spherical: true,
                         key: "coordinate"
                      }},
                    {$unwind:"$booksRef"},
                    {$lookup:{ from: "Books", localField: "booksRef", foreignField: "id", as: "Book"}},
                    {$project: {
                                    Title: "$Book.title",
                                    Author: "$Book.author",
                                    Part: "$Book.part",
                                    Coords: "$coordinate",
                                    Population: "$population",
                                    City: "$name",
                                    DistanceInMeters: "$distance"        
                    }}
                 ]
            }
        ]
    ],
    mysql: [
        `with cities as (select * from Locations where name = ?)
        select distinct BookParts.id, BookParts.title, BookParts.author from cities 
        left join BookLocations on BookLocations.location_id = cities.id
        left join BookParts on BookParts.id = BookLocations.bookparts_id`,

        `with selectedtitles as (select * from BookParts where title = ? limit 1)
        select selectedtitles.id, title, part, author, location_id, index_in_book, name, ST_AsText(coordinate), population, timezone from selectedtitles
        left join BookLocations on BookLocations.bookparts_id = selectedtitles.id
        left join Locations on Locations.id = BookLocations.location_id`,

        `with author as (select * from BookParts where author = "Abraham Lincoln"),
        locs as (select id, JSON_OBJECT("name", name, "population", population, "locaation", ST_AsText(coordinate)) as locObj from Locations)
        select author.id, title, part, author, json_arrayagg(locObj) as "locations" from author
        left join BookLocations on BookLocations.bookparts_id = author.id
        left join locs on BookLocations.location_id = locs.id
        group by author.id`,

        `with cities as (select *, ST_Distance(ST_GeomFromText(?, 4326), coordinate)/1000 as km_away from Locations where ST_Contains(ST_GeomFromText(ST_AsText(ST_Buffer(ST_GeomFromText(?, 0), 125/111.226)), 4326), coordinate))
        select distinct BookParts.id, title, part, author,  ST_AsText(coordinate) as point from cities
        inner join BookLocations  on cities.id = BookLocations.location_id
        left join BookParts on BookParts.id = BookLocations.bookparts_id`
    ]
}

app.get('/execute/3/:engine/:lat/:lng/:range', (req, res)=>{
    let engine = req.params.engine,
        lat = req.params.lat,
        lng = req.params.lng,
        range = req.params.range;

    let queryToExecture = queries[engine][3];

    if(engine === "mysql"){
        let point = `POINT(${lat} ${lng})`
        connection.query(
            queryToExecture,
            [point, point],
            function(err, results) {
                let time = Date.now() - timeStart;
                res.json({
                    query: queryToExecture,
                    time, 
                    data: results
                })
            }
        );
        return;
    }else{
        let query = queryToExecture[1]([
            lng, lat
        ]);
        db.collection(queryToExecture[0]).aggregate(query).toArray(function(err, data) {
            let time = Date.now() - timeStart;
            res.json({
                query: [queryToExecture[0], query],
                time,
                data
            })   
        })
        return;   
    }

    res.json({error: "ERR CODE: Eat some nails and gimme the right query"})
})


app.get('/execute/:query/:engine/:param',(req, res)=>{
    let query = parseInt(req.params.query),
        engine = req.params.engine,
        param = req.params.param;
    
    let queryToExecture = queries[engine][query];

    let timeStart = Date.now();

    if(engine === "mysql"){
        connection.query(
            queryToExecture,
            [param],
            function(err, results) {
                if(err){
                    return res.json({error: "i fucked up", err})
                }
                let time = Date.now() - timeStart;
                res.json({
                    query: queryToExecture,
                    time, 
                    data: results
                })
            }
            );
            return;
    }else{
        let query = queryToExecture[1](param);
        db.collection(queryToExecture[0]).aggregate(query).toArray(function(err, data) {
            let time = Date.now() - timeStart;
            res.json({
                query: [queryToExecture[0], query],
                time,
                data
            })     
        })
        
        return;       
    }


    res.json({error: "ERR CODE: Eat some nails and gime the right query"})

});

app.use(express.static(__dirname+'/static'))

app.listen(8002, _=>{
    console.log("Come at bee-movie bro")
})

