const fs = require('fs');
const moment = require('moment'); // Use moment.js for date manipulation

// Function to process the date field and add augmentedData attribute
function processJson(inputFile, outputFile) {
    fs.readFile(inputFile, 'utf8', (err, jsonData) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            // Parse the JSON data
            const data = JSON.parse(jsonData);

            // Process each object in the JSON array
            data.forEach(item => {
                if (item.Erscheinungsdatum) {
                    const date = item.Erscheinungsdatum;
                    console.log(date)
                    // Check if the date is in German format like "15. März 2023"
                    const germanDatePattern = /\d{1,2}\. \w+ \d{4}/;
                    if (germanDatePattern.test(date)) {
                        const transformedDate = moment(date, 'D. MMMM YYYY', 'de').format('DD.MM.YYYY');
                        item.Erscheinungsdatum = transformedDate;
                    } else if (/[A-Za-z\s]+ \d{4}$/.test(date)) {
                        // Check if the date contains a city name followed by a year
                        const yearMatch = date.match(/\d{4}$/);
                        if (yearMatch) {
                            const year = yearMatch[0];
                            item.Erscheinungsdatum = `01.01.${year}`;
                            item.augmentedData = true;
                        }
                    }
                }


            });

            // Convert the modified data back to a JSON string
            const transformedJson = JSON.stringify(data, null, 2);

            // Write the transformed JSON data to the output file
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

// Specify the input and output file paths
const inputFile = 'germanBooks_duplicatesRemoved.json';
const outputFile = 'transformed_data.json';

// Call the function to process the JSON data
processJson(inputFile, outputFile);
