const fs = require('fs');

// Function to process the Kategorien field
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
                if (item.Kategorien) {
                    // Check if the Kategorien field contains a comma
                    if (item.Kategorien.includes(',')) {
                        // Split the Kategorien string by commas and trim each element
                        item.Kategorien = item.Kategorien.split(',').map(category => category.trim());
                    } else {
                        // Ensure Kategorien is in array format even if there is no comma
                        item.Kategorien = [item.Kategorien.trim()];
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
const inputFile = 'transformed_data.json';
const outputFile = 'transformed_data2.json';

// Call the function to process the JSON data
processJson(inputFile, outputFile);
