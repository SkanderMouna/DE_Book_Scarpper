const puppeteer = require('puppeteer');
const fs = require('fs');
let browser

async function scrapeBookInfo(url,page) {


    await page.goto(url);

    const title = await page.$eval('.booktitle', element => element.textContent.trim());
    const author = await page.$eval('.bookauthor>a', element => element.textContent.trim());
    const category = await page.$eval('.smaller', element => element.textContent.trim());
    const description = await page.$eval('.smaller:nth-child(3)', element => element.textContent.trim());
    const coverUrl = await page.$eval('.cover', element => element.getAttribute('src'));


    return {title, author, category, description, url, coverUrl};
}

async function main() {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    const urls = fs.readFileSync('BooksUrls.txt', 'utf8').split('\n').filter(url => url.trim() !== '');

    let scrapedData = [];
    const outputFilePath="../ScrapedBooks/booksInfo-perlentaucher"
    if (fs.existsSync(outputFilePath)) {
        const existingData = fs.readFileSync(outputFilePath, 'utf8');
        scrapedData = JSON.parse(existingData);
    }
    for (let index = 5; index < urls.length; index++) {
        try {
            console.log(`scrap book : ${index} ${urls[index]}`)
            const info = await scrapeBookInfo(urls[index].trim(),page);
          scrapedData.push(info)
            fs.writeFileSync(outputFilePath, JSON.stringify(scrapedData, null, 2));
        } catch (e) {
            //in case of Error (mostly because of selector) go to the next book
            continue;
        }
    }

    await browser.close();
}

main()
