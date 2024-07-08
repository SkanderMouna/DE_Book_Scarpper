const fs = require('fs');

// Function to read, flatten, and write JSON data
function flattenJson(inputFile, outputFile) {
    // Read the JSON data from the input file
    fs.readFile(inputFile, 'utf8', (err, jsonData) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            // Parse the JSON data
            const data = JSON.parse(jsonData);

            // Flatten the nested lists
            const flattenedData = data.flat();

            // Convert the flattened data back to a JSON string
            const flattenedJson = JSON.stringify(flattenedData, null, 2);

            // Write the flattened JSON data to the output file
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

// Specify the input and output file paths
const inputFile = './ScrapedBooks/booksInfo-kulturkauhaus.json';
const outputFile = './ScrapedBooks/booksInfo-kulturkauhaus2.json';

// Call the function to process the JSON data
flattenJson(inputFile, outputFile);
