const { exec } = require('child_process');

async function getLocationsFromText(text){
    let nerOutput = await new Promise((resolve, reject) => {
        exec('cd extractData/stanford-ner &&  java -mx10000m -cp "*:lib/*" edu.stanford.nlp.ie.crf.CRFClassifier -loadClassifier classifiers/english.all.3class.distsim.crf.ser.gz -textFile ../../zipfiles/'+text, { encoding: 'utf8',
        timeout: 0,
        maxBuffer: 10000*1024*1024, //increase here
        killSignal: 'SIGTERM',
        cwd: null,
        env: null }, (err, stdout, stderr) => {
            if (err) {
              reject(err);
            }
          
            resolve(stdout);
        });
    })

    return [...nerOutput.matchAll(/([^ ]*\/LOCATION )+/gm)].map(i => {
        return [i.index, i[0].replace(/\/LOCATION/gm, "").trim()]
    })
}


module.exports = getLocationsFromText