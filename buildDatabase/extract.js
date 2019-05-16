function take25lines(text) {
    let textArr = text.split('\n');
    let smallText = "";
    for (let i = 0; i < 25; i++) {
        smallText = smallText + '\n' + textArr[i]
    }
    return smallText;
}

function extractAuthorName(text){
    const smallText = take25lines(text)
    const pattern = /^(Author: )(.*)/gm;
    let match = pattern.exec(smallText);
    return match[2];
}


function extractTitle(text, partstr) {
    const smallText = take25lines(text)
    const pattern = /^(Title: )(.*)/gm;
    let match = pattern.exec(smallText);
    return match[2].replace(new RegExp(partstr, 'g'), '').replace(/(\.|,|\s)+$/, '')
}

function extractPart(text) {
    const smallText = take25lines(text)
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





