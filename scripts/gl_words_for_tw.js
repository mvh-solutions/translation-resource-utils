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


const result =
    pk.gqlQuerySync(
        `{
                twl: document(withBook:"T00" docSetId: "abc_xyz") {
                    tableSequences {
                        rows(columns:[0, 3, 5]) {
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
                                    tokens(includeContext:true) {
                                        payload
                                        scopes(startsWith:["attribute/milestone/zaln/x-content/", "attribute/spanWithAtts/w/x-occurrence/"])
                                }
                            }
                        }
                    }
                }
            }
        }`
    );

console.log(result.data.scripture.documents[0].cvIndexes[0].verses[1].verse[0].tokens)

