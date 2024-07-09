const fs = require('fs');

const loadJsonData = (filePath) => {
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } else {
        throw new Error(`File not found: ${filePath}`);
    }
};

const saveJsonData = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

/**
 * Remove duplicated based on the title : duplicates are due to when scraping data somtimes it crashes because of internet
 * and I had to restart the script from the last book index it stopped at
 * @param data
 * @returns {*}
 */
const removeDuplicatesByTitle = (data) => {
    const seenTitles = new Set();
    return data.filter(item => {
        const isDuplicate = seenTitles.has(item.Titel);
        seenTitles.add(item.Titel);
        return !isDuplicate;
    });
};

(async () => {
    const inputFilePath = "germanBooks.json";
    const outputFilePath = 'germanBooks_duplicatesRemoved.json';

    try {
        const data = loadJsonData(inputFilePath);
        const uniqueData = removeDuplicatesByTitle(data);
        saveJsonData(outputFilePath, uniqueData);
        console.log(`Number of unique objects: ${uniqueData.length}`);

        console.log(`Duplicates removed. Cleaned data saved to ${outputFilePath}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
})();
