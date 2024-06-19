const fs = require('fs');

// Load JSON data from a file
const loadJsonData = (filePath) => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } else {
        throw new Error(`File not found: ${filePath}`);
    }
};

// Save JSON data to a file
const saveJsonData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Remove duplicates by title
const removeDuplicatesByTitle = (data) => {
    const seenTitles = new Set();
    return data.filter(item => {
        const isDuplicate = seenTitles.has(item.title);
        seenTitles.add(item.title);
        return !isDuplicate;
    });
};

(async () => {
    const inputFilePath = 'germanBooks.json';
    const outputFilePath = 'germanBooks-removedDuplicates.json';

    try {
        // Load JSON data from the input file
        const data = loadJsonData(inputFilePath);

        // Remove duplicates by title
        const uniqueData = removeDuplicatesByTitle(data);

        // Save the unique data to the output file
        saveJsonData(outputFilePath, uniqueData);

        console.log(`Duplicates removed. Cleaned data saved to ${outputFilePath}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();
