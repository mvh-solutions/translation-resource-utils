const projectId = 'fresh-iridium-383914';
const location = 'global';
const text = `
These verses introduce the Pentateuch (Genesis—Deuteronomy) and teach Israel that the world was created, ordered, and populated by the one true God and not by the gods of surrounding nations. • God blessed three specific things: animal life (*1:22-25*), human life (*1:27*), and the Sabbath day (*2:3*). This trilogy of blessings highlights the Creator’s plan: Humankind was made in God’s image to enjoy sovereign dominion over the creatures of the earth and to participate in God’s Sabbath rest.\\n\\n
`;

// Imports the Google Cloud Translation library
const {TranslationServiceClient} = require('@google-cloud/translate');

// Instantiates a client
const translationClient = new TranslationServiceClient();

async function translateText() {
    // Construct request
    const request = {
        parent: `projects/${projectId}/locations/${location}`,
        contents: [text],
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: 'en',
        targetLanguageCode: 'fr',
    };

    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
        console.log(`Translation: ${translation.translatedText}`);
    }
}

translateText();
