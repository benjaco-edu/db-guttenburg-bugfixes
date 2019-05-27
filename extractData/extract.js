function take25lines(text) {
    let textArr = text.split('\n');
    let smallText = "";
    for (let i = 0; i < 25; i++) {
        smallText = smallText + '\n' + textArr[i]
    }
    return smallText;
}

function extractAuthorName(smallText){    
    const pattern = /^(Author: )(.*)/gm;        // author name is formatted differently between files
    const pattern2 = /(by )([a-zA-Z|\h]*)/gm;   // 2nd version   
    let match = pattern.exec(smallText);
    if (match !== null)
        return match[2];

    match = pattern2.exec(smallText)
        return match[2];
}

function extractTitle(smallText, partstr) {
    const pattern = /^(Title: )(.*)/gm;
    const pattern2 = /^(The Project Gutenberg EBook of )([a-zA-Z|\s]*)/gm;
    let match = pattern.exec(smallText);
    if (match !== null)
        return match[2].replace(new RegExp(partstr, 'g'), '').replace(/(\.|,|\s)+$/, '')
    
    match = pattern2.exec(smallText);
        return match[2]
}

function extractPart(smallText) {
    const pattern = /^(Title: )(.*(Part \d*))/gm;
    let match = pattern.exec(smallText);
    if (match != null) {
        return match[3];
    } else {
        return null;
    }
}

function removeFooter(text){
    const pattern = /^(\*\*\* END OF THIS PROJECT GUTENBERG)/gm
    let match = pattern.exec(text)
    if(match == null)
        return text;
    return text.substring(0, match.index);
}

module.exports = {take25lines, extractAuthorName, extractPart, extractTitle, removeFooter}





