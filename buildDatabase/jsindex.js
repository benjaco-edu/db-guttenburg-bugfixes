var mysql = require('mysql2/promise');
let dbName = "greenbugDb";

(async () => {

    let con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "test1234"
    });

    await con.execute(`DROP DATABASE if exists ${dbName};`);
    await con.execute(`CREATE DATABASE ${dbName};`);

        
    con = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "test1234",
        database: dbName
    });

//Locations - id, locname, point
    await con.execute(`
        CREATE table Locations(
            id INT AUTO_INCREMENT , 
            locname VARCHAR(100),
            point GEOMETRY,
            PRIMARY KEY (id)
            );
    `);

//BookParts - id, title, part, author, text
    await con.execute(`
        CREATE table BookParts(
            id INT AUTO_INCREMENT, 
            title VARCHAR(250),
            part VARCHAR(50),
            author VARCHAR(200),
            text MEDIUMTEXT,
            PRIMARY KEY (id)
            );
    `);

//BookLocations - bookparts_id, location_id
    await con.execute(`
        CREATE TABLE BookLocations(
            id INT AUTO_INCREMENT,
            bookparts_id INT,
            location_id INT,
            PRIMARY KEY (id),
            FOREIGN KEY (bookparts_id) REFERENCES BookParts(id),
            FOREIGN KEY (location_id) REFERENCES Locations(id)
        );
    `);

    process.exit(0);
})();


