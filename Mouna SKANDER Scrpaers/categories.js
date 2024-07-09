const fs = require('fs');
const readline = require('readline');

// List of valid categories
const validCategories = [
    'Sachbücher', 'Handwerk', 'Schule', 'Fachbücher', 'Krimi&Thriller', 'Kochen&Backen',
    'Fantasy', 'Ratgeber', 'Länder&Städte', 'Romanze', 'Drama', 'Erotik', 'Manga', 'Comic',
    'Kinderbücher', 'Abenteuer', 'Jugendbücher', 'Reisen', 'Sprachen&Lernen', 'Dokumentationen',
    'Horror', 'TV-Serien', 'NewAdult', 'Entspannung', 'Action', 'Self-Publishing', 'Komödie',
    'Klassiker', 'Biografien', 'Familie', 'Animation', 'ScienceFiction', 'Comedy&Humor',
    'Jugendhörbücher', 'BookTok', 'Eastern', 'Western', 'Anime', 'Literaturverfilmungen', 'Märchen',
    'Romane', 'Hobby', 'Liebesromane', 'Sachbuch', 'Freizeit', 'Biografie', 'Kochen-Backen',
    'Comics', 'Biographie', 'Gesellschaft', 'Grossdruckbuecher', 'Sport','Bauen','Karriere','Gesellschafts','Gesundheit','Krimi','Kunst',
    'Roman','Orte und Träume','Fiktion','Thriller','Politik','Geschichte','Religion'
];
// Read the JSON file
async function fetchData() {
    try {
        const data = fs.readFileSync('MounasGermanBooks.json', 'utf8');
        const books = JSON.parse(data);
        await checkCategories(books);
        fs.writeFileSync('MounasGermanBooks.json', JSON.stringify(books, null, 2));
        console.log('Updated categories saved to MounasGermanBooks.json');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Check the categories and prompt for updates if necessary
async function checkCategories(books) {
    for (const book of books) {
        if (!book.Kategorien) {
            // Skip books without a Kategorien property
            console.log(`Skipping book with no Kategorien: ${book.title || 'unknown title'}`);
            continue;
        }

        for (let i = 0; i < book.Kategorien.length; i++) {
            // Automatically replace 'Gesund' with 'Gesundheit'
            if (book.Kategorien[i] === 'Gesund') {
                book.Kategorien[i] = 'Gesundheit';
                console.log(`Replaced 'Gesund' with 'Gesundheit' for book: ${book.title || 'unknown title'}`);
            }

            // Check for valid categories and prompt for new ones if invalid
            if (!validCategories.includes(book.Kategorien[i])) {
                await promptForNewCategory(book, i);
            }
        }
    }
}

// Prompt the user to input a new category if the current one is invalid
function promptForNewCategory(book, index) {
    return new Promise((resolve) => {
        console.log(`Original Category: ${book.Kategorien[index]} Book name: ${book.Titel}`);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter new category: ', (newCategory) => {
            book.Kategorien[index] = newCategory;
            rl.close();
            resolve();
        });
    });
}

// Execute the script
fetchData();
