let fs = require("fs")

let data = JSON.parse(fs.readFileSync("booksAndCitiesComplete.json"))


let known = {}

for(let i of Object.keys(data)){
	let val = parseInt(i.replace(".txt", ""))
	if(known[val] === undefined){
		known[val] = i
	}else{
		console.log(known[val] + " and " + i + " bothes produces "+val)
	}
}
