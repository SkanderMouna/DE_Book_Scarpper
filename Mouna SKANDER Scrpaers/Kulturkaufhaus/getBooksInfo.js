const puputeer = require("puppeteer")
const fs = require("fs")
const readline = require("readline")
const linksPath = "./BooksUrls.txt"
const booksInfoPath = "../ScrapedBooks/booksInfo-kulturkauhaus.json"
const links = []
const bookInfos = []

async function acceptCookies(page) {
    try {
        await page.click('[title="Click to accept use of cookies"]');
        await wait()

    } catch (error) {

        console.log("")
    }

}

async function readFile() {
    const fileStream = fs.createReadStream(linksPath);
    const rl = readline.createInterface({
        input: fileStream, crlfDelay: Infinity
    });

    for await (const link of rl) {

        links.push(link);
    }
}

async function getter(page, selector) {
    try {
        return await page.evaluate((selector) => {
            return document.querySelector(selector).innerText

        }, selector)
    } catch (e) {
        return ""
    }
}

async function getHref(page, selector) {
    try {
        return await page.evaluate((selector) => {
            return document.querySelector(selector).getAttribute("data-request-href")
        }, selector)
    } catch (e) {
        return ""
    }
}

async function getBookDetails(page, index) {
    try {
        return await page.evaluate((index) => {
            const key = document.querySelector(`.bibliographies>div:nth-child(${index})>span`).innerText
            const value = document.querySelector(`.bibliographies>div:nth-child(${index})>span:nth-child(2)`).innerText
            return {[key]: value}
        }, index)
    } catch (e) {
        return ""
    }


}

async function getAllBookDetails(page) {
    let bookDetail = {}
    const child = await page.$$(".bibliographies>div")
    for (let i = 1; i <= child.length; i++) {
        const detail = await getBookDetails(page, i)
        Object.assign(bookDetail, detail)
    }
    return bookDetail
}

async function wait() {
    return new Promise(resolve => {
        setTimeout(resolve, 5000);
    });
}

async function getLongDescription(page) {

    await page.evaluate(async () => {
        return document.querySelector(".description>.button>a").click()
    })
    //await page.click(".description>.button>a")
    await wait();
    return await page.evaluate(async () => {
        return document.querySelector(".dialogContent").innerText
    })
}

async function getBookInfo(page) {
    let bookInfoArray = []
    let bookInfo = {}
    const bookDescription = await getter(page, "h1.biblioTitle>span>span")
    const bookTitle = await getter(page, ".cot")
    const subTitle = await getter(page, ".biblioSubTitle")
    const author = await getter(page, ".biblioAuthor")
    const productType = await getter(page, ".biblioProductType")
    const binding = await getter(page, ".biblioBinding")
    const frontCover = await getHref(page, "span[title='Show big cover image']>a")
    const backCover = await getHref(page, "span[title='Show back cover image']>a")
    const longDescription = await getLongDescription(page)
    bookInfo = {
        Title: bookTitle,
        Short_Description: bookDescription,
        Long_Description: longDescription,
        Url: page.url(),
        Sub_Title: subTitle,
        Author: author,
        Product_Type: productType,
        Binding: binding,
        Front_Cover: "https://www.kulturkaufhaus.de" + frontCover,
        Back_cover: "https://www.kulturkaufhaus.de" + backCover,
        Details: await getAllBookDetails(page),
    };
    bookInfoArray.push(bookInfo)
    return bookInfoArray
}

async function getInfos(page) {

    for (let i = 0; i < links.length; i++) {

        try {
            await page.goto("https://www.kulturkaufhaus.de" + links[i])
            await acceptCookies(page)
            const bookInfo = await getBookInfo(page)
            bookInfos.push(bookInfo)
            console.log(`book ${i} finished`)
        } catch (e) {
            console.log(e.message)
            continue
        }
    }

}

async function writeFile() {
    const jsonString = JSON.stringify(bookInfos, null, 2);
    fs.writeFile(booksInfoPath, jsonString, err => {
        if (err) {
            console.log("Error in writing file")
        }
        console.log("File successfully created ")

    })
}

async function getAllInfo() {
    const browser = await puputeer.launch({headless: false, args: ["--start-maximixed"]})
    let page = await browser.newPage()
    await readFile()
    await getInfos(page)
    await writeFile()

}

getAllInfo()