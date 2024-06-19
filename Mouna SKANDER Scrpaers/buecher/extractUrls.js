const puppeteer = require('puppeteer');
const fs = require('fs');

async function wait(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let allLinks = []
    const categoriesData = fs.readFileSync('categoriesLinks.txt', 'utf8').split('\n');
    for (let categoryData of categoriesData) {
        let [category, link] = categoryData.split(';');
        category = category.trim();
        link = link.trim();
        console.log(`Scraping Urls of category: ${category}`)
        for (let i = 1; i < 15; i++) {
            await page.goto(`${link}list_page/${i}`)
            await page.waitForSelector('.product-list-block');
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('.product-list-block .list-product .image-column .cover img'))
                    .map(img => img.getAttribute('data-link'));
            });

            links.forEach(productLink => {
                allLinks.push(`${category};${productLink}`);
            });

        }
    }
    fs.writeFileSync('BooksUrls.txt', allLinks.join('\n'));

    await browser.close();
    console.log('Buecher: Book urls have been successfully saved in BooksUrls.txt ');
})();
