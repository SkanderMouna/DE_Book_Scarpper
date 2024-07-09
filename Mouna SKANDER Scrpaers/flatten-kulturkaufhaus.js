const fs = require('fs');

/**
 * it will flaten kulturkaufhaus dataset
 * @param inputFile
 * @param outputFile
 */
function flattenJson(inputFile, outputFile) {
    fs.readFile(inputFile, 'utf8', (err, jsonData) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            const data = JSON.parse(jsonData);
            const flattenedData = data.flat();
            const flattenedJson = JSON.stringify(flattenedData, null, 2);
            fs.writeFile(outputFile, flattenedJson, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to the file:', err);
                    return;
                }
                console.log(`Flattened JSON data has been written to ${outputFile}`);
            });
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
        }
    });
}

const inputFile = './ScrapedBooks/booksInfo-kulturkauhaus.json';
const outputFile = './ScrapedBooks/booksInfo-kulturkauhaus-flatten.json';

flattenJson(inputFile, outputFile);
