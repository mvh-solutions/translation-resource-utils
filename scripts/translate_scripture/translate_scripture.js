const path = require('path');
const fse = require('fs-extra');
const {TranslationServiceClient} = require('@google-cloud/translate');
const {Proskomma} = require('proskomma-core');
const axios = require('axios');

const usage = "USAGE: node translate_scripture.js <fromLang> <toLang> <model> <usSomethingInPath> <usfmOutPath>";
if (process.argv.length !== 7) {
    throw new Error(`Incorrect number of arguments\n${usage}`);
}
const fromLang = process.argv[2];
const toLang = process.argv[3];
const model = process.argv[4];
if (!["nllb", "gc"].includes(model)) {
    throw new Error(`Unknown model '${model}\n${usage}'`);
}
const inPath = path.resolve(process.argv[5]);
if (!fse.existsSync(inPath)) {
    throw new Error(`Input file '${inPath}' does not exist\n${usage}`);
}
const inContent = fse.readFileSync(inPath).toString();
const outPath = path.resolve(process.argv[6]);
if (fse.existsSync(outPath)) {
    throw new Error(`Output file '${outPath}' already exists\n${usage}`);
}

const projectId = 'fresh-iridium-383914';
const location = 'global';
const translationClient = new TranslationServiceClient();

const translateTexts = async () => {
    const pk = new Proskomma();
    pk.importDocument(
        {lang: "xxx", abbr: "yyy"},
        (inPath.endsWith('.usfm') ? "usfm" : "usx"),
        inContent
    )
    const query = `
       {
  documents {
    book: header(id:"bookCode")
    cvIndexes {
      chapter
      verses {
        verse {
          verseRange
          text
        }
      }
    }
  }
}
    `;
    const result = pk.gqlQuerySync(query);
    const outContent = [
        `\\id ${result.data.documents[0].book} (${fromLang} to ${toLang})`,
        `\\h ${result.data.documents[0].book}`,
        `\\toc1 ${result.data.documents[0].book}`,
        `\\mt1 ${result.data.documents[0].book}  (${fromLang} to ${toLang})`,
    ];
    let currentChapter = null;
    let currentVerse = null;
    for (const chapterRecord of result.data.documents[0].cvIndexes) {
        currentChapter = chapterRecord.chapter;
        console.log("C" + currentChapter);
        outContent.push(`\\c ${currentChapter}`);
        outContent.push(`\\p`);
        for (const versesRecord of chapterRecord.verses) {
            const verseRecord = versesRecord.verse[0];
            if (!verseRecord) {
                continue;
            }
            currentVerse = verseRecord.verseRange;
            console.log("v" + currentVerse);
            const translated = await translateOneText(model, verseRecord.text);
            outContent.push(`\\v ${currentVerse}\n${translated.replace(/[\t\r\n ]/g, " ").trim()}`);
        }
    }
    fse.writeFileSync(outPath, outContent.join('\n'));
}

const translateOneText = async (model, text) => {
    if (model === 'gc') {
        const request = {
            parent: `projects/${projectId}/locations/${location}`,
            contents: [text],
            mimeType: 'text/plain', // mime types: text/plain, text/html
            sourceLanguageCode: fromLang,
            targetLanguageCode: toLang,
        };

        const [response] = await translationClient.translateText(request);
        return response.translations
            .map(t => t.translatedText)
            .join(" ");
    } else if (model === 'nllb') {
        const url = 'http://192.168.1.66:6060/translate';
        const preSplitText = text.replace(/([^.]\\. )/g, "$1<<>>");
        const sentences = preSplitText.split("<<>>");
        let translatedSentences = [];
        for (const sentence of sentences) {
            const args = {
                'source': sentence,
                'src_lang': fromLang,
                'tgt_lang': toLang
            }
            const response = await axios.post(url, args)
            translatedSentences.push(response.data.translation.join(" "));
        }
        return translatedSentences.join(' ');
    } else {
        throw new Error(`Unknown model '${model}\n${usage}' in translateOneText()`);
    }
}

translateTexts().then();
