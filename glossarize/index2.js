const path = require('path');
const fse = require('fs-extra');
const {Proskomma} = require('proskomma-core');

const summary = {};
for (const inputFile of fse.readdirSync(process.argv[2])) {
    const usfm = fse.readFileSync(path.join(process.argv[2], inputFile)).toString();

    const pk = new Proskomma();

    pk.importDocument({lang: "abc", abbr: "xyz"}, "usfm", usfm);

    const req = `{
    documents {
      bookCode: header(id: "bookCode")
      mainBlocks {
        items(withScopes: "spanWithAtts/w") {
            type
            subType
            payload
        }
      }
    }
}`;

    const res = pk.gqlQuerySync(req);
    const document = res.data.documents[0];
    const bookCode = document.bookCode;
    for (const block of document.mainBlocks) {
        let itemText = "";
        for (const item of block.items) {
            if (item.type === "token") {
                itemText += item.payload;
            } else if (item.type === "scope" && item.subType === "start") {
            } else if (item.type === "scope") {  // End scope
                let lemma = item.payload.split("/")[5] || itemText;
                if (itemText.length === 0) {
                    continue;
                }
                if (!summary[lemma]) {
                    summary[lemma] = {};
                }
                if (!summary[lemma][itemText]) {
                    summary[lemma][itemText] = {};
                }
                if (!summary[lemma][itemText][bookCode]) {
                    summary[lemma][itemText][bookCode] = 0;
                }
                summary[lemma][itemText][bookCode]++;
                itemText = "";
            }
        }
    }
}
console.log(`\\id GLO - Pain sur les eaux
\\mt Glossaire
\\c 1`);
let firstLetter = "";
for (const glossTerm of Object.keys(summary).sort()) {
    if (glossTerm.substring(0,1) !== firstLetter) {
        firstLetter = glossTerm.substring(0,1);
        console.log(`\\cp ${firstLetter}`);
    }
    console.log(`\\p \\k ${glossTerm}\\k*~:`);
}
// console.log(JSON.stringify(summary, null, 2));
