const fs = require('fs');
const path = require('path');

const mergeJsonFilesAndCountObjects = async () => {
    try {
        const file1Path = path.join(__dirname, './ScrapedBooks/booksInfo-buecher.json');
        const file2Path = path.join(__dirname, './ScrapedBooks/booksInfo-kulturkauhaus.json');
        const file3Path = path.join(__dirname, './ScrapedBooks/booksInfo-perlentaucher.json');
        const file1Data = JSON.parse(fs.readFileSync(file1Path, 'utf8'));
        const file2Data = JSON.parse(fs.readFileSync(file2Path, 'utf8'));
        const file3Data = JSON.parse(fs.readFileSync(file3Path, 'utf8'));

        const mergedData = [...file1Data, ...file2Data, ...file3Data];

        const outputPath = path.join(__dirname, 'germanBooks.json');
        fs.writeFileSync(outputPath, JSON.stringify(mergedData, null, 2), 'utf8');

        console.log('JSON files have been merged successfully!');

        const numberOfObjects = mergedData.length;
        console.log(`Total number of Books is : ${numberOfObjects}`);
    } catch (error) {
        console.error('Error merging JSON files:', error);
    }
};

mergeJsonFilesAndCountObjects();
