const fse = require('fs-extra');
const path = require('path');
const {Proskomma} = require('proskomma');

const argv = process.argv;

if (argv.length !== 5) {
    throw new Error(`Expected 5 args, not ${argv.length}\nUSAGE: node gl_words_for_tw <twlPath> <usfmPath> <outPath>`);
}
const twlPath = path.resolve(argv[2]);
const usfmPath = path.resolve(argv[3]);
const outPath = path.resolve(argv[4]);

const tsvToTable = (tsv, hasHeadings) => {
    const ret = {
        headings: [],
        rows: [],
    };
    let rows = tsv.split(/[\n\r]+/);

    if (hasHeadings) {
        ret.headings = rows[0].split('\t');
        rows = rows.slice(1);
    }

    for (const row of rows) {
        ret.rows.push(row.split('\t'));
    }
    return ret;
};

const pk = new Proskomma();

// Load twl file as T00
pk.importDocument({
        lang: 'abc',
        abbr: 'xyz',
    },
    'tsv',
    JSON.stringify(
        tsvToTable(
            fse.readFileSync(
                path.resolve(__dirname, twlPath),
            )
                .toString(),
            true,
        ),
        {},
    ),
    null,
    2,
);

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
                twl: document(withBook:"T00" docSetId: "abc_xyz") {
                    tableSequences {
                        rows(columns: [0, 3, 4, 5]) {
                            text
                        }
                    }
                }
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
const allMatches = {};
for (const cvIndex of result.data.scripture.documents[0].cvIndexes) {
    const chapter = cvIndex.chapter;
    allMatches[chapter] = [];
    for (
        const verseItems of cvIndex.verses
            .map(
                v => v.verse
                    .map(v => v.items)
                    .reduce((a, b) => [...a, ...b], [])
            )
        ) {
        let matches = [];
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
                        currentWrapped.wrapperText = currentWrapped.wrappers.map(w => w["x-content"]).join(' ');
                        matches.push(currentWrapped);
                        currentWrapped = null;
                    }
                }
                if (
                    item.payload.startsWith("attribute/milestone/zaln") &&
                    item.subType === 'start' &&
                    ["x-lemma", "x-content", "x-occurrence"].includes(item.payload.split("/")[3])
                ) {
                    currentWrapped.wrappers[currentWrapped.wrappers.length - 1][item.payload.split("/")[3]] = item.payload.split("/")[5];
                }
            }
            if (item.subType === 'wordLike' && currentWrapped) {
                currentWrapped.wrapped.push(item.payload);
            }
        }
        allMatches[chapter].push(matches);
    }
}

// Match TWL to USFM alignment
const keywordTranslations = {};
for (const [cv, content, occurrence, url] of result.data.twl.tableSequences[0].rows.map(r => r.map(c => c.text))) {
    let [c, v] = cv.split(':');
    v = parseInt(v);
    const chapterMatch = allMatches[c];
    if (!chapterMatch) {
        continue;
    }
    if (!chapterMatch[v]) {
        continue;
    }
    const wordRecord = chapterMatch[v].filter(w => w.wrapperText === content)[0];
    if (!wordRecord) {
        continue;
    }
    if (wordRecord.wrappers[0]["x-occurrence"] !== occurrence) {
        continue;
    }
    if (!keywordTranslations[url]) {
        keywordTranslations[url] = {};
    }
    const glWord = wordRecord.wrapped.join(' ');
    if (!keywordTranslations[url][glWord]) {
        keywordTranslations[url][glWord] = 0;
    }
    keywordTranslations[url][glWord]++;
}
fse.writeFileSync(outPath, JSON.stringify(keywordTranslations, null, 2));
