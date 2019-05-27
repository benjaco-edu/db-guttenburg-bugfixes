let fs = require("fs");
const readCity = require('../common/readCity');
const extractors = require('../extractData/extract');

Object.filter = function( obj, predicate) {
    var result = {}, key;

    for (key in obj) {
        if (obj.hasOwnProperty(key) && predicate(obj[key])) {
            result[key] = obj[key];
        }
    }

    return result;
};



let booksAndCities = JSON.parse(fs.readFileSync("../booksAndCitiesAddOnBen.json"))
delete booksAndCities["13655.txt.20041109"]
booksAndCities = Object.filter(booksAndCities, i => typeof i.error !== "undefined" )


//console.log(JSON.stringify(Object.keys(booksAndCities)));

console.log("start");

let mapper = {"60005.txt":"batlf10.txt","60000.txt":"ajtl10.txt","60001.txt":"allyr10.txt","60002.txt":"alpsn10.txt","60003.txt":"balen10.txt","60004.txt":"baleng2.txt","60006.txt":"bgopr10.txt","60007.txt":"brnte10.txt","60008.txt":"bstjg10.txt","60009.txt":"cambp10.txt","60010.txt":"canbe10.txt","60011.txt":"cantp10.txt","60012.txt":"cfrz10.txt","60013.txt":"crsnk10.txt","60014.txt":"esbio10.txt","60015.txt":"grybr10.txt","60016.txt":"mklmt10.txt","60017.txt":"morem10.txt","60018.txt":"mspcd10.txt","60019.txt":"penbr10.txt","60020.txt":"pgjr10.txt","60021.txt":"pntvw10.txt","60022.txt":"prcpg10.txt","60023.txt":"prhg10.txt","60024.txt":"prhsb10.txt","60025.txt":"rlsl110.txt","60026.txt":"rlsl210.txt","60027.txt":"rmlav10.txt","60028.txt":"sesli10.txt","60029.txt":"svyrd10.txt","60030.txt":"tecom10.txt","60031.txt":"utrkj10.txt","60032.txt":"vpasm10.txt","60033.txt":"wldsp10.txt","60034.txt":"wtrbs10.txt","60035.txt":"zncli10.txt","60036.txt":"12hgp10a.txt"};


let ErrsArray = Object.keys(mapper);
let resArr = [];
let resObj = {};
let go =0;
let bad=0;
(async ()=>{


    ErrsArray.forEach(element => {
        
        let fileContent = fs.readFileSync('/home/jacob/devFolder/DBs/GutenbergAssignment/archive/root/gutenberg/zipfiles/' + mapper[element]).toString();
        

        fileContent = extractors.removeFooter(fileContent);
        let smalltext = extractors.take25lines(fileContent)
        
        try {
                
                let Part = extractors.extractPart(smalltext);
                resObj[element] = {
                    Part,
                    Authorname: extractors.extractAuthorName(smalltext),
                    Title: extractors.extractTitle(smalltext, Part),
                }
                go=go+1;
            } catch (error) {
                bad=bad+1
                resObj[element] ={
                    FirstLines: smalltext
                }                        
            }

//            fs.writeFileSync('./booksAndCitiesAddOns.json', JSON.stringify(resObj), 'utf8');


    });


console.log("done");
console.log("gode : ", go);
console.log("bad : " , bad);



})();
