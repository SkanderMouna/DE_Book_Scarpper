const fs = require('fs');

/**
 *This script will convert categories into an array and split using comma
 * @param inputFile
 * @param outputFile
 */
function processJson(inputFile, outputFile) {
    fs.readFile(inputFile, 'utf8', (err, jsonData) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            const data = JSON.parse(jsonData);

            data.forEach(item => {
                if (item.Kategorien) {
                    if (item.Kategorien.includes(',')) {
                        item.Kategorien = item.Kategorien.split(',').map(category => category.trim());
                    } else {
                        item.Kategorien = [item.Kategorien.trim()];
                    }
                }
            });

            const transformedJson = JSON.stringify(data, null, 2);
            fs.writeFile(outputFile, transformedJson, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing to the file:', err);
                    return;
                }
                console.log(`Transformed JSON data has been written to ${outputFile}`);
            });
        } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
        }
    });
}

const inputFile = "germanBooks_normelizedDate.json";
const outputFile = 'MounasGermanBooks.json';

processJson(inputFile, outputFile);
