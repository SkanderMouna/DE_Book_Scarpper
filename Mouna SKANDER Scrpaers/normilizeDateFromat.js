const fs = require('fs');
const moment = require('moment');

/**
 * Normalize ErscheinungsDatum to follow dd.MM.YYYY
 * there are ErscheinungsDatum sturctured as follow city year this will take day 1 of month 1 and add an attribute augmentedDate as true
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
                if (item.Erscheinungsdatum) {
                    const date = item.Erscheinungsdatum;
                    console.log(date)
                    const germanDatePattern = /\d{1,2}\. \w+ \d{4}/;
                    if (germanDatePattern.test(date)) {
                        const transformedDate = moment(date, 'D. MMMM YYYY', 'de').format('DD.MM.YYYY');
                        item.Erscheinungsdatum = transformedDate;
                    } else if (/[A-Za-z\s]+ \d{4}$/.test(date)) {
                        const yearMatch = date.match(/\d{4}$/);
                        if (yearMatch) {
                            const year = yearMatch[0];
                            item.Erscheinungsdatum = `01.01.${year}`;
                            item.augmentedData = true;
                        }
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

const inputFile = 'germanBooks_duplicatesRemoved.json';
const outputFile = 'germanBooks_normelizedDate.json';

processJson(inputFile, outputFile);
