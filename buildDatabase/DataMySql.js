class DataMySql{
    
    constructor(con){
        this.con = con;
        this.insertDataLocation=this.insertDataLocation.bind(this);
        this.insertDataBookParts=this.insertDataBookParts.bind(this);
        this.insertBookLocations=this.insertBookLocations.bind(this);
    }

    insertDataLocation(locName, Point){
        return this.con.execute(`
            INSERT INTO Locations (locname, point) values ( ${locName}, ${Point});
        `);
    }
    
    insertDataBookParts(title, part, author, text){
        return this.con.execute(`
            INSERT INTO BookParts (title, part, author, text) values (${title},${part},${author},${text})
        `);
    }
    
    insertBookLocations(bookparts_id, location_id){
       return this.con.execute(`
            INSERT INTO BookLocations (bookparts_id,location_id) values (${bookparts_id},${location_id})
        `);
    }

}
