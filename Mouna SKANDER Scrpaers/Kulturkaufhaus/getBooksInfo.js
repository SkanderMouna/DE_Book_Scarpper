const puppeteer = require("puppeteer");
const fs = require("fs");
const readline = require("readline");
const linksPath = "./BooksUrls.txt";
const booksInfoPath = "../ScrapedBooks/booksInfo-kulturkauhaus.json";
const links = [];
const bookInfos = [];

async function acceptCookies(page) {
    try {
        await page.click('[title="Click to accept use of cookies"]');
        await wait();
    } catch (error) {
        console.log("No cookies acceptance needed.");
    }
}

async function readFile() {
    const fileStream = fs.createReadStream(linksPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const link of rl) {
        links.push(link);
    }
}

async function getter(page, selector) {
    try {
        return await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.innerText : "";
        }, selector);
    } catch (e) {
        return "";
    }
}

async function getHref(page, selector) {
    try {
        return await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.getAttribute("data-request-href") : "";
        }, selector);
    } catch (e) {
        return "";
    }
}

async function getBookDetails(page, index) {
    try {
        return await page.evaluate((index) => {
            const key = document.querySelector(`.bibliographies>div:nth-child(${index})>span`).innerText;
            const value = document.querySelector(`.bibliographies>div:nth-child(${index})>span:nth-child(2)`).innerText;
            return { [key]: value };
        }, index);
    } catch (e) {
        return {};
    }
}

async function getAllBookDetails(page) {
    let bookDetail = {};
    const child = await page.$$(".bibliographies>div");
    for (let i = 1; i <= child.length; i++) {
        const detail = await getBookDetails(page, i);
        Object.assign(bookDetail, detail);
    }
    return bookDetail;
}

async function wait() {
    return new Promise(resolve => {
        setTimeout(resolve, 5000);
    });
}

async function getLongDescription(page) {
    try {
        await page.click(".description>.button>a");
        await wait();
        return await page.evaluate(() => {
            const element = document.querySelector(".dialogContent");
            return element ? element.innerText : "";
        });
    } catch (e) {
        return "";
    }
}

async function getBookInfo(page) {
    const bookInfo = {};
    const bookDescription = await getter(page, "h1.biblioTitle>span>span");
    const bookTitle = await getter(page, ".cot");
    const subTitle = await getter(page, ".biblioSubTitle");
    const author = await getter(page, ".biblioAuthor");
    const productType = await getter(page, ".biblioProductType");
    const binding = await getter(page, ".biblioBinding");
    const frontCover = await getHref(page, "span[title='Show big cover image']>a");
    const backCover = await getHref(page, "span[title='Show back cover image']>a");
    const longDescription = await getLongDescription(page);

    bookInfo.Titel = bookTitle;
    bookInfo.Beschreibung_kurz = bookDescription;
    bookInfo.Beschreibung = longDescription;
    bookInfo.Url = page.url();
    bookInfo.Sub_Title = subTitle;
    bookInfo.Autor = [author];
    bookInfo.Produktart = productType;
    bookInfo.Binding = binding;
    bookInfo.Img = [
        "https://www.kulturkaufhaus.de" + frontCover,
        "https://www.kulturkaufhaus.de" + backCover
    ];
    bookInfo.mehr = await getAllBookDetails(page);

    return bookInfo;
}

async function getInfos(page) {
    for (let i = 0; i < links.length; i++) {
        try {
            await page.goto("https://www.kulturkaufhaus.de" + links[i]);
            await acceptCookies(page);
            const bookInfo = await getBookInfo(page);
            bookInfos.push(bookInfo);
            console.log(`book ${i} finished`);
        } catch (e) {
            console.log(e.message);
            continue;
        }
        if(i==5){break}
    }
}

async function writeFile() {
    const jsonString = JSON.stringify(bookInfos, null, 2);
    fs.writeFile(booksInfoPath, jsonString, err => {
        if (err) {
            console.log("Error in writing file");
        }
        console.log("File successfully created");
    });
}

async function getAllInfo() {
    const browser = await puppeteer.launch({ headless: false, args: ["--start-maximized"] });
    const page = await browser.newPage();
    await readFile();
    await getInfos(page);
    await writeFile();
    await browser.close();
}

getAllInfo();
