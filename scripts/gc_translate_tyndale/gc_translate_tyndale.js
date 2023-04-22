const path = require('path');
const fse = require('fs-extra');
const {TranslationServiceClient} = require('@google-cloud/translate');

const usage = "USAGE: node gc_translate_tyndale.js <lang> <inPath> <outPath>";
if (process.argv.length !== 5) {
    throw new Error(`Incorrect number of arguments\n${usage}`);
}
const lang = process.argv[2];
const inPath = path.resolve(process.argv[3]);
if (!fse.existsSync(inPath)) {
    throw new Error(`Input file '${inPath}' does not exist\n${usage}`);
}
const inFile = fse.readFileSync(inPath).toString();
const outPath = path.resolve(process.argv[4]);
if (fse.existsSync(outPath)) {
    throw new Error(`Output file '${outPath}' already exists\n${usage}`);
}

const projectId = 'fresh-iridium-383914';
const location = 'global';
const translationClient = new TranslationServiceClient();

const translateTexts = async () => {
    const rows = inFile.split("\n");
    let newRows = [];
    let c = 0;
    for (const row of rows) {
        const cells = row.split('\t');
        if (!cells[0].startsWith('JON')) {
            continue;
        }
        cells[3] = await translateOneText(cells[3]);
        newRows.push(cells.join('\t'));
        if (c % 10 === 0) {
            console.log(c);
        }
        c++;
    }
    const outContent = newRows.join("\n");
    fse.writeFileSync(outPath, outContent);
}

const translateOneText = async text => {
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: 'en',
        targetLanguageCode: lang,
    };

    const [response] = await translationClient.translateText(request);
    return response.translations
        .map(t => t.translatedText)
        .join(" ");
}

translateTexts().then();
