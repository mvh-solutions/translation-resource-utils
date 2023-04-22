const {TranslateClient, TranslateTextCommand} = require("@aws-sdk/client-translate");
const path = require('path');
const fse = require('fs-extra');

const usage = "USAGE: node amz_translate_tyndale.js <lang> <inPath> <outPath>";
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
const client = new TranslateClient({region: "eu-west-3"});

const translateTexts = async () => {
    const rows = inFile.split("\n");
    let newRows = [];
    let c = 0;
    for (const row of rows) {
        const cells = row.split('\t');
        if (!cells[0].startsWith('JON')) {
            continue;
        }
        if (!cells[3]) {
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
    const input = {
        Text: text,
        SourceLanguageCode: "en",
        TargetLanguageCode: lang,
        Settings: {
            Formality: "INFORMAL"
        }
    };
    const command = new TranslateTextCommand(input);
    const response = await client.send(command);
    return response.TranslatedText;
}

translateTexts().then();
