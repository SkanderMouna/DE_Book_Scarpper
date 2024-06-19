const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeBookURLs() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.perlentaucher.de/buchKSL/deutsche-romane.html');
    await page.screenshot({path:"t.png"})
    console.log("dd")
    const bookURLs = [];

    for (let i = 0; i < 425; i++) {
        await page.waitForSelector('.related-next');
        const currentBookURLs = await page.$$eval('.book.teaser-block>h3>a', links => {
            return links.map(link => link.href);
        });
        console.log(bookURLs);
        bookURLs.push(...currentBookURLs);

        const nextPageButton = await page.$('.related-next');

    }
    fs.writeFileSync('BooksUrls.txt', bookURLs.join('\n'));

    await browser.close();
}

scrapeBookURLs();
