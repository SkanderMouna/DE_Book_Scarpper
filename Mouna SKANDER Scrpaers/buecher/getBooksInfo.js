const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function wait(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

async function scrapeBookInfo(url, page, Kategorien) {
    await page.goto(url);
    await wait(10)
    const Titel = await page.$eval('[data-behavior="productTitle"]', element => element.textContent.trim());
    let Beschreibung = await page.$eval('[data-behavior="productDescLong"]', element => element.textContent.trim());
    if (Beschreibung.startsWith("Produktbeschreibung")) {
        Beschreibung = Beschreibung.slice("Produktbeschreibung".length).trim();
    }
    const Autor = await page.$eval('.author', element => {
        return element.textContent.split(',').map(item => item.trim());
    });

    const coverUrl = await page.$eval('img.cover', element => element.getAttribute('src'));
    const Img = [coverUrl];
    let ISBN;
    let Erscheinungsdatum
    let Verlag
    let Auflage=""
    const elementsText = await page.$$eval('.product-details-value', elements => {
        return elements.map(element => element.innerText);
    });

    elementsText.forEach(tmp => {
        if (tmp.includes("ISBN-13:")) {
            ISBN = tmp.replace("ISBN-13:", "").trim();
        }

        if (tmp.includes("Erscheinungstermin:")) {
            Erscheinungsdatum = tmp.replace("Erscheinungstermin:", "").trim();
        }

        if (tmp.includes("Verlag:")) {
            Verlag = tmp.replace("Verlag:", "").trim();
        }
        if(tmp.includes("Aufl."))
        {
            Auflage=tmp.trim();
        }
    })


    const Produktart = await page.$eval('li.type>span:nth-of-type(2)', element => element.textContent.trim());

    return {Titel, Beschreibung, Autor, Img, ISBN, Produktart, Erscheinungsdatum, Kategorien, Verlag, Auflage};
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
