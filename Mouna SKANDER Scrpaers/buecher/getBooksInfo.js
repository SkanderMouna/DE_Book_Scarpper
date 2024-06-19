const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function wait(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

async function scrapeBookInfo(url, page, category) {
    await page.goto(url);
    const title = await page.$eval('[data-behavior="productTitle"]', element => element.textContent.trim());
    const author = await page.$eval('.author', element => element.textContent.trim());
    const description = await page.$eval('[data-behavior="productDescLong"]', element => element.textContent.trim());
    const coverUrl = await page.$eval('.cover', element => element.getAttribute('src'));

    return { title, author, category, description, url, coverUrl };
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const urlsFilePath = 'BooksUrls.txt';
    const outputFilePath = '../ScrapedBooks/booksInfo-buecher.json';


    let scrapedData = [];

    // Read existing data from the output file if it exists
    if (fs.existsSync(outputFilePath)) {
        const existingData = fs.readFileSync(outputFilePath, 'utf8');
        scrapedData = JSON.parse(existingData);
    }

    // Read URLs and categories from the file
    const lines = fs.readFileSync(urlsFilePath, 'utf8').split('\n').filter(line => line.trim() !== '');

    for (let i = 0; i < lines.length; i++) {
        const [category, url] = lines[i].split(';').map(part => part.trim());
        if (url) {
            try {
                console.log(`Scraping book ${i}: ${url}`);
                const info = await scrapeBookInfo(url, page, category);
                scrapedData.push(info);

                // Write incrementally to the output file
                fs.writeFileSync(outputFilePath, JSON.stringify(scrapedData, null, 2));
            } catch (e) {
                console.error(`Error scraping ${url}: ${e.message}`);
                continue;
            }
        }
    }

    await browser.close();
    console.log('Scraping completed. Data has been saved to booksInfo-buecher.json');
})();
