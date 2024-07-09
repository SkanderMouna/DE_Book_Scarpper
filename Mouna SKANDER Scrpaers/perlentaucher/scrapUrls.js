const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeBookURLs() {
    const browser = await puppeteer.launch({ headless: false }); // Launch the browser
    const page = await browser.newPage(); // Open a new page
    await page.goto('https://www.perlentaucher.de/buchKSL/deutsche-romane.html'); // Go to the target URL

    const bookURLs = [];

    while (true) {
        // Wait for the book links to be loaded
        await page.waitForSelector('.book.teaser-block>h3>a');

        // Extract the URLs of the books on the current page
        const currentBookURLs = await page.$$eval('.book.teaser-block>h3>a', links => {
            return links.map(link => link.href);
        });
        bookURLs.push(...currentBookURLs);

        console.log(`Collected ${currentBookURLs.length} URLs from this page.`);

        // Check if there is a next page
        const nextPageButton = await page.$('.related-next');
        if (!nextPageButton) {
            break; // Exit the loop if there is no next page button
        }

        // Click the next page button
        await Promise.all([
            nextPageButton.click(),
            page.waitForNavigation({ waitUntil: 'networkidle0' }) // Wait for the navigation to complete
        ]);
    }

    // Write the URLs to a file
    fs.writeFileSync('BooksUrls.txt', bookURLs.join('\n'));
    console.log(`Total collected URLs: ${bookURLs.length}`);

    await browser.close(); // Close the browser
}

scrapeBookURLs();
