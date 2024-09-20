const fse = require('fs-extra');
const path = require('path');

const dirname = path.resolve(process.argv[2]);
const bests = {
    sense: {},
    style: {},
    level: {}
};
const worsts = {
    sense: {},
    style: {},
    level: {}
};
for (const filename of fse.readdirSync(dirname)) {
    if (!filename.endsWith('.json')) {
        continue;
    }
    const fqpath = path.resolve(path.join(dirname, filename));
    const record = fse.readJsonSync(fqpath);
    for (const [criterion, winningTrad] of Object.entries(record.best)) {
        if (winningTrad === "SAME") {
            continue;
        }
        if (!bests[criterion][winningTrad]) {
            bests[criterion][winningTrad] = 0;
        }
        bests[criterion][winningTrad]++;
        const otherTrad = record.translations.filter(t => t !== winningTrad)[0];
        if (!worsts[criterion][otherTrad]) {
            worsts[criterion][otherTrad] = 0;
        }
        worsts[criterion][otherTrad]++;
    }
}
for (const criterion of ["sense", "style", "level"]) {
    console.log(`${criterion.toUpperCase()}\tnBetter\tnWorst`);
    for (const translator of ["DeepL Inf", "DeepL", "TT", "ChatGPT", "GC", "AWS Inf", "NLLB", "AWS"]) {
        console.log(`${translator}\t${bests[criterion][translator]}\t${worsts[criterion][translator]}`);
    }
}
console.log("ALL\tnBetter\tnWorst");
for (const translator of ["DeepL Inf", "DeepL", "TT", "ChatGPT", "GC", "AWS Inf", "NLLB", "AWS"]) {
    console.log(`${translator}\t${(bests["sense"][translator] + bests["style"][translator] + bests["level"][translator]) /3}\t${(worsts["sense"][translator] + worsts["style"][translator] + worsts["level"][translator]) /3}`);
}
