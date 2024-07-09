const puppeteer = require('puppeteer');
const fs = require("fs");

let dataHrefAttributes = "";

async function acceptCookies(page) {
    try {
        await page.click('a[title="Klicken, um der Verwendung von allen Cookies zuzustimmen"]');
        new Promise(resolve => {
            setTimeout(resolve, 2000);
        });
    } catch (err) {
        console.log("No cookies to accept or already accepted.");
    }
}

async function getAllHref(page) {
    const hrefs = await page.evaluate(() => {
        const elements = document.querySelectorAll('[data-href]');
        let hrefs = "";
        elements.forEach(element => {
            hrefs += element.getAttribute('data-href') + "\n";
        });
        return hrefs;
    });
    dataHrefAttributes += hrefs;
}

async function writeInFile() {
    fs.writeFile(filePath, dataHrefAttributes, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data has been written to the file successfully.');
    });
}

const filePath = "./BooksUrls.txt";

async function scrapData() {
    // Launch a headless browser
    const browser = await puppeteer.launch({headless: false, args: ['--start-maximized']});
    const page = await browser.newPage();
    await page.setViewport({width: 1920, height: 1080});
    await page.goto('https://www.kulturkaufhaus.de/de/suchergebnis');

    // Accept cookies
    await acceptCookies(page);

    for (let i = 1; i <= 42; i++) {
        try {
            await page.waitForSelector('[data-href]', {timeout: 10000});
            await getAllHref(page);
            await wait(500)
            const nextPageButton = await page.$("a[title='Nächste Seite']");
            if (!nextPageButton) break; // Exit if the next page button is not found

            await Promise.all([
                nextPageButton.click(),
                //page.waitForNavigation({ waitUntil: 'networkidle0' })
            ]);
            await wait(500)
            console.log(`Page ${i} processed.`);
        } catch (e) {
            console.error(`Error on page ${i}:`, e.message);
            break; // Exit the loop if there's an error
        }
    }

    await writeInFile();
    await browser.close();
}

async function wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

scrapData();
