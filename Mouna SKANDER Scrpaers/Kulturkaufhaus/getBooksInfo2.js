const puppeteer = require("puppeteer")
const fs = require("fs")
const linksPath = "./BooksUrls.txt"
const outputFilePath = "../ScrapedBooks/booksInfo-kulturkauhaus.json"
let page

async function getBooksDetails() {
    const links = fs.readFileSync(linksPath, 'utf8').split('\n').filter(line => line.trim() !== '');
    const browser = await puppeteer.launch({args: ["--start-maximixed"]})
    page = await browser.newPage()
    let scrapedData = [];

    for (let i = 0; i < links.length; i++) {
        console.log(links[i])
        const details = await getDetails("https://www.kulturkaufhaus.de" + links[i]);
        scrapedData.push(details)
        fs.writeFileSync(outputFilePath, JSON.stringify(scrapedData, null, 2));

    }
}

async function getDetails(link) {
    await page.goto(link);
    await wait(500)

    let Titel = ""
    let Beschreibung = ""
    let Autor = ""
    let Img = ""
    let ISBN = ""
    let Produktart = ""
    let Erscheinungsdatum = ""
    let Kategorien = ""
    let Verlag = ""
    let Auflage = ""
    let mehr = ""

    try {
        Titel = await page.$eval('.cot', element => element.textContent.trim());

        Beschreibung = await page.$eval('h1.biblioTitle>span>span', element => element.textContent.trim());

        const authors = await page.$eval('.biblioAuthor', element => element.textContent.trim());
        Autor = [authors]
        const frontCover = await page.$eval(".icon-zoom>a", element => element.getAttribute('data-request-href'));
        // const backCover = await page.$eval("span[title='Show back cover image']", element => element.getAttribute('data-request-href'));

        // const frontCover=""
        const backCover = ""
        Img = [frontCover, backCover]

        const mehr = await page.$$(".bibliographies>div")
        for (let i = 1; i <= mehr.length; i++) {
            const key = await page.$eval(`.bibliographies>div:nth-child(${i})>span`, element => element.textContent.trim());
            if (key.includes("ISBN")) {
                ISBN = await page.$eval(`.bibliographies>div:nth-child(${i})>span:nth-child(2)`, element => element.textContent.trim());
            }
            if (key.includes("Einband")) {
                Produktart = await page.$eval(`.bibliographies>div:nth-child(${i})>span:nth-child(2)`, element => element.textContent.trim());
            }
            if (key.includes("Erscheinungsdatum")) {
                Erscheinungsdatum = await page.$eval(`.bibliographies>div:nth-child(${i})>span:nth-child(2)`, element => element.textContent.trim());
            }
            if (key.includes("Verlag")) {
                Verlag = await page.$eval(`.bibliographies>div:nth-child(${i})>span:nth-child(2)`, element => element.textContent.trim());
            }
            if (key.includes("Auflage")) {
                Auflage = await page.$eval(`.bibliographies>div:nth-child(${i})>span:nth-child(2)`, element => element.textContent.trim());
            }


        }
    } catch (e) {
    }


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
        Auflage,
        mehr
    };
}

async function wait(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

getBooksDetails()