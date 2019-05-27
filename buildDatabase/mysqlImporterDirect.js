var mysql = require('mysql2/promise');
let dbName = "greenbugDb";
const Readable = require('stream').Readable

module.exports = async function ({ cities, bookParts, relations }) {

    console.log("Start mysql import")

    this.con = await mysql.createConnection({
        host: "localhost",
        user: "nodejs",
        password: "nodecode"
    });

    console.log("Connected")

    await con.execute(`DROP DATABASE if exists ${dbName};`);
    await con.execute(`CREATE DATABASE ${dbName};`);

    this.con = await mysql.createConnection({
        host: "localhost",
        user: "nodejs",
        password: "nodecode",
        database: dbName
    });

    //Locations - id, locname, point
    await con.execute(`
        CREATE table Locations(
            id INT , 
            
            name VARCHAR(100),
            coordinate GEOMETRY NOT NULL srid 4326,
            population INT,
            timezone VARCHAR(100),

            PRIMARY KEY (id)
        );
    `);

    //BookParts - id, title, part, author
    await con.execute(`
        CREATE table BookParts(
            id INT , 

            title VARCHAR(250),
            part VARCHAR(50),
            author VARCHAR(200),

            PRIMARY KEY (id)
            );
    `);

    //BookLocations - bookparts_id, location_id
    await con.execute(`
        CREATE TABLE BookLocations(
            bookparts_id INT,
            location_id INT,
            index_in_book INT,

            PRIMARY KEY (bookparts_id, location_id, index_in_book),
            FOREIGN KEY (bookparts_id) REFERENCES BookParts(id),
            FOREIGN KEY (location_id) REFERENCES Locations(id)
        );
    `);

    console.log("db created")

    await con.execute("set autocommit=0;")

    let i = 0

    console.log("city")
    for (let item of cities) {
        await con.execute(`insert into Locations (id, name, coordinate, population, timezone) values (
            ${item.id},
            "${String(item.name).replace(/"/g, '\\"')}",
            ST_GeomFromText("POINT(${item.lat} ${item.lng})", 4326), 
            ${item.population}, 
            "${String(item.tz)}"); `)
        if ((i++) % 1000 == 0) {
            await con.execute("COMMIT;");
            console.log(".");
        }
    }

    await con.execute("COMMIT;")

    console.log("bookpart");
    for (let item of bookParts) {
        await con.execute(`insert into BookParts (id, title, part, author) values (
            ${item.id},
            "${String(item.title).replace(/"/g, '\\"')}",
            "${String(item.part).replace(/"/g, '\\"')}",
            "${String(item.author).replace(/"/g, '\\"')}"
        ); `)
        if ((i++) % 1000 == 0) {
            await con.execute("COMMIT;");
            console.log(".");
        }
    }
    await con.execute("COMMIT;")


    console.log("relations")
    for (let item of relations) {
        await con.execute(`insert into BookLocations (bookparts_id, location_id, index_in_book) values (
            ${item.bookpartsId}, 
            ${item.locationId},
            ${item.indexInBook}
        );` );
        if ((i++) % 25000 == 0) {
            await con.execute("COMMIT;");
            console.log(".");
        }
    }
    await con.execute("COMMIT;");


    console.log("done");

} 