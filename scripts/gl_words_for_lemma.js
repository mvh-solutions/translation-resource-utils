const fse = require('fs-extra');
const path = require('path');
const {Proskomma} = require('proskomma');

const argv = process.argv;

if (argv.length !== 4) {
    throw new Error(`Expected 4 args, not ${argv.length}\nUSAGE: node gl_words_for_lemma <usfmPath> <outPath>`);
}
const usfmPath = path.resolve(argv[2]);
const outPath = path.resolve(argv[3]);

const pk = new Proskomma();

// Load USFM
pk.importDocument({
        lang: 'abc',
        abbr: 'uvw',
    },
    'usfm',
    fse.readFileSync(
        path.resolve(__dirname, usfmPath),
    )
        .toString(),
);

// Run query
const result =
    pk.gqlQuerySync(
        `{
                scripture: docSet(id:"abc_uvw") {
                    documents {
                        cvIndexes {
                            chapter
                            verses {
                                verse {
                                    verseRange
                                    items {
                                        type
                                        subType
                                        payload
                                }
                            }
                        }
                    }
                }
            }
        }`
    );

// Get alignment info from USFM
const lemmaTranslations = {};
for (const cvIndex of result.data.scripture.documents[0].cvIndexes) {
    for (
        const verseItems of cvIndex.verses
        .map(
            v => v.verse
                .map(v => v.items)
                .reduce((a, b) => [...a, ...b], [])
        )
        ) {
        let wrappers = [];
        let currentWrapped = null;
        for (const item of verseItems) {
            if (item.type === "scope") {
                if (item.payload.startsWith("milestone/zaln") && item.subType === "start") {
                    if (currentWrapped) {
                        currentWrapped.wrappers.push({});
                    } else {
                        currentWrapped = {wrappers: [{}], wrapped: []};
                    }
                    wrappers.push({});
                }
                if (item.payload.startsWith("milestone/zaln") && item.subType === "end") {
                    wrappers.pop();
                    if (wrappers.length === 0) {
                        for (const wrapper of currentWrapped.wrappers) {
                            if (!lemmaTranslations[wrapper["x-lemma"]]) {
                                lemmaTranslations[wrapper["x-lemma"]] = {};
                            }
                            const content = currentWrapped.wrapped.join(' ');
                            if (!lemmaTranslations[wrapper["x-lemma"]][content]) {
                                lemmaTranslations[wrapper["x-lemma"]][content] = 0;
                            }
                            lemmaTranslations[wrapper["x-lemma"]][content]++;
                        }
                        currentWrapped = null;
                    }
                }
                if (
                    item.payload.startsWith("attribute/milestone/zaln") &&
                    item.subType === 'start' &&
                    ["x-lemma"].includes(item.payload.split("/")[3])
                ) {
                    currentWrapped.wrappers[currentWrapped.wrappers.length - 1][item.payload.split("/")[3]] = item.payload.split("/")[5];
                }
            }
            if (item.subType === 'wordLike' && currentWrapped) {
                currentWrapped.wrapped.push(item.payload);
            }
        }
    }
}

// Rework lemma info
const lemmaReport =
    Object.entries(lemmaTranslations)
        .sort((a, b) => a[0].toLocaleLowerCase().localeCompare(b[0].toLocaleLowerCase()))
        .map(
            lem => [
                lem[0],
                Object.entries(lem[1])
                    .sort((a, b) => b[1] - a[1])
                    .map(e => `${e[0]}: ${e[1]}`)
            ]
        )

fse.writeFileSync(outPath, JSON.stringify(lemmaReport, null, 2));
