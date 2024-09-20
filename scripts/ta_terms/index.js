const path = require('path');
const fse = require('fs-extra');

// Use titles from subdir of first dir as base, match with subdir of second dir or leave empty
const taDir1 = path.resolve(process.argv[2]);
const taDir2 = path.resolve(process.argv[3]);

console.log(`${taDir1} => ${taDir2}`);

for (const d1Subdir of fse.readdirSync(taDir1)) {
    if (d1Subdir.includes(".")) {
        continue;
    }
    const d1Title = fse.readFileSync(path.join(taDir1, d1Subdir, "title.md")).toString().trim();
    let d2Title = "";
    if (fse.existsSync(path.join(taDir2, d1Subdir, "title.md"))) {
        d2Title = fse.readFileSync(path.join(taDir2, d1Subdir, "title.md")).toString().trim();
    }
    console.log(`${d1Subdir}\t${d1Title}\t${d2Title}`);
}
