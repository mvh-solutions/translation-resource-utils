const fse = require('fs-extra');
const {Proskomma} = require('proskomma-core');

const usfm = fse.readFileSync(process.argv[2]).toString();

const pk = new Proskomma();

pk.importDocument({lang: "grc", abbr: "ugnt"}, "usfm", usfm);

const req = `{
    documents {
      bookCode: header(id: "bookCode")
      cvIndexes {
        chapter
        verses {
          verse {
            verseRange
            tokens(withSubTypes: "wordLike") {payload}
          }
        }
      }
    }
}`;

const res = pk.gqlQuerySync(req);
// console.log(JSON.stringify(res, null, 2));
const document = res.data.documents[0];
const bookCode = document.bookCode;
console.log(`REF\tVERSE\tCHAPTER\tBOOK`);
let bCount = 0;
for (const chapter of document.cvIndexes) {
    let cCount = 0;
    for (const verses of chapter.verses) {
        for (const verse of verses.verse) {
            cCount += verse.tokens.length;
            console.log(`${bookCode} ${chapter.chapter}:${verse.verseRange}\t${verse.tokens.length}\t\t`);
        }
    }
    bCount += cCount;
    console.log(`${bookCode} ${chapter.chapter}\t\t${cCount}\t`);
}
console.log(`${bookCode}\t\t\t${bCount}`);
