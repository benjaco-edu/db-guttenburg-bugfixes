let fs = require("fs")

let base = JSON.parse(fs.readFileSync("booksAndCitiesBase.json", 'utf8').toString())

fs.writeFileSync("booksAndCitiesBaseFormated.json", JSON.stringify(base, null, 2), 'utf8')

console.log(Object.keys(base).length)


// add ner
let ner = JSON.parse(fs.readFileSync("booksAndCitiesAddOnNERmRAM.json", 'utf8').toString())
for(let key of Object.keys(ner)){
    base[key] = ner[key]
}

// add regex
let regex = JSON.parse(fs.readFileSync("booksAndCitiesAddOnExtraREGEX.json", 'utf8').toString())
//fs.writeFileSync("booksAndCitiesAddOnExtraREGEX.json", JSON.stringify(regex, null, 2), 'utf8')

for(let key of Object.keys(regex)){
    if(typeof regex[key].FirstLines === "string")
        continue

    base[key].Part = regex[key].Part;
    base[key].Authorname = regex[key].Authorname;
    base[key].Title = regex[key].Title;

    try{
        delete base[key].error
    }catch(e){}

}

// add scraped
let scrapedTitles = JSON.parse(fs.readFileSync("addonScrapedTitles.json", 'utf8').toString())

for(let key of Object.keys(scrapedTitles)){
    if(key.includes(".txt") === false)
        continue

    let parts = scrapedTitles[key].split(/ by /g)
    let author = null, title;
    if(parts.length == 1){
        title = parts[0]
    }else{
        author = parts.pop()
        title = parts.join(' by ')
    }
    base[key].Authorname = author;
    base[key].Title = title;
    try{
        delete base[key].error
    }catch(e){}
    
}

fs.writeFileSync("booksAndCitiesComplete.json", JSON.stringify(base, null, 2), 'utf8')