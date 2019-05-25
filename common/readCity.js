const fs = require('fs');
const fastCsv = require('fast-csv');

function getCityNames(filename) {
    let objects = {}; // id => object
    let names = {}; // names => id
    
    return new Promise(resolve => {
        const stream = fs.createReadStream(filename);
        let id = 1;

        const csvStream = fastCsv({delimiter: '\t'})
            .on("data", function(data){
                let eng = data[2];
                let local = data[1];

                objects[id.toString()] = {
                    name: eng,
                    lat: data[4],
                    lng: data[5],
                    population: data[14],
                    tz: data[17]
                };

                names[eng] = id.toString();
                if(eng != local){
                    names[local] = id.toString();
                }

                id++;
            })
            .on("end", function(){
                resolve({objects, names});
            });

        stream.pipe(csvStream);
    })
}

/*getCityNames("cities15000.txt").then(i => {
    console.log(i)
})*/

module.exports = getCityNames
