const puppeteer = require('puppeteer');
const fs = require('fs');
let browser

async function scrapeBookInfo(url, page) {

    await page.goto(url);

    const Titel = await page.$eval('.booktitle', element => element.textContent.trim());
    const Beschreibung = await page.$eval('.smaller:nth-child(3)', element => element.textContent.trim());
    const Autor = await page.$eval('.bookauthor>a', element => element.textContent.trim());
    const coverUrl = await page.$eval('.cover', element => element.getAttribute('src'));

    const Img = [coverUrl]
    let tmp = await page.$eval('.tiny.gray', element => element.textContent.trim());
    tmp = tmp.replace(/ISBN\s+\d+/, ',');
    console.log(tmp)

    let ISBN = await page.$eval('.nobr', element => element.textContent.trim());
    ISBN=ISBN.replace(/ISBN\s*/, '');

    const Produktart = tmp.split(',')[2];

    const Erscheinungsdatum = tmp.split(',')[1].trim();

    const Kategorien = await page.$eval('.smaller', element => element.textContent.trim());
    const Verlag = tmp.split(',')[0];

    const Auflage = ""
    return {
        Titel,
        Beschreibung,
        Autor,
        Img,
        ISBN,
        Produktart,
        Erscheinungsdatum,
        Kategorien,
        Verlag,
        Auflage
    };
}

async function main() {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    const urls = fs.readFileSync('BooksUrls.txt', 'utf8').split('\n').filter(url => url.trim() !== '');

    let scrapedData = [];
    const outputFilePath = "../ScrapedBooks/booksInfo-perlentaucher.json"
    if (fs.existsSync(outputFilePath)) {
        const existingData = fs.readFileSync(outputFilePath, 'utf8');
        scrapedData = JSON.parse(existingData);
    }
    for (let index = 0; index < urls.length; index++) {
        try {
            console.log(`scrap book : ${index} ${urls[index]}`)
            const info = await scrapeBookInfo(urls[index].trim(), page);
            scrapedData.push(info)
            fs.writeFileSync(outputFilePath, JSON.stringify(scrapedData, null, 2));
        } catch (e) {
            continue;
        }
        // if(index==10)
        // {break}
    }

    await browser.close();
}

main()
