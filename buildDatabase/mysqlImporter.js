var mysql = require('mysql2/promise');
let dbName = "greenbugDb";
const Readable = require('stream').Readable

//mysql -containername : mysql01 -root/ pass1234 - 3306



module.exports = async function ({ cities, bookParts, relations }) {


    console.log("Start mysql import")

    let con = await mysql.createConnection({
        host: "localhost",
        user: "nodejs",
        password: "nodecode"
    });

    console.log("Connected")

    await con.execute(`DROP DATABASE if exists ${dbName};`);
    await con.execute(`CREATE DATABASE ${dbName};`);





    con = await mysql.createConnection({
        host: "localhost",
        user: "nodejs",
        password: "nodecode",
        database: dbName
    });

    console.log("Connected to "+dbName)

    //const stream = new Readable()

    let fs = require('fs');
    try {
        fs.unlinkSync("somefile.txt")
    } catch (error) {
        
    }
    var stream = fs.createWriteStream('someFile.txt', { flags : 'w' });
    //stream.pipe(filestream)
    
    //Locations - id, locname, point
    stream.write(`
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
    stream.write(`
        CREATE table BookParts(
            id INT , 

            title VARCHAR(250),
            part VARCHAR(50),
            author VARCHAR(200),

            PRIMARY KEY (id)
            );
    `);

    //BookLocations - bookparts_id, location_id
    stream.write(`
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

    stream.write("set autocommit=0;")

    let i = 0

    for (let item of cities) {
        stream.write(`insert into Locations (id, name, coordinate, population, timezone) values (
            ${item.id},
            "${String(item.name).replace(/"/g,'\\"')}",
            ST_GeomFromText("POINT(${item.lat} ${item.lng})", 4326), 
            ${item.population}, 
            "${String(item.tz)}"); `)

        if ((i++) % 100 == 0) {
            stream.write("COMMIT;");
        }
    }

    stream.write("COMMIT;")

    for (let item of bookParts) {
        stream.write(`insert into BookParts (id, title, part, author) values (
            ${item.id},
            "${String(item.title).replace(/"/g,'\\"')}",
            "${String(item.part).replace(/"/g,'\\"')}",
            "${String(item.author).replace(/"/g,'\\"')}"
        ); `);

        if ((i++) % 100 == 0) {
            stream.write("COMMIT;");
        }
    }
    stream.write("COMMIT;")


    for (let item of relations) {
        stream.write(`insert into BookLocations (bookparts_id, location_id, index_in_book) values (
            ${item.bookpartsId}, 
            ${item.locationId},
            ${item.indexInBook}
        );` );
            
        if ((i++) % 100 == 0) {
            stream.write("COMMIT;");
        }
    }
    stream.write("COMMIT;");
    stream.end()

    await new Promise((resolve, reject) => {
        stream.on('close', () => {
            console.log('There will be no more data.');
            resolve();
        });
    })
   


    // local stream
    /*
    const sql = 'source ./stream.sql;';
    await con.query({
        sql: sql,
        infileStreamFactory: function (path) { console.log("make a stream for "+path); return stream }
    });

    console.log("done");*/

    

}