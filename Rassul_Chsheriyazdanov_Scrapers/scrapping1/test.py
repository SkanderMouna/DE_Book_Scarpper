import os
import time
import json
import random
import zipfile
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent
from selenium import webdriver
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import undetected_chromedriver as uc

# Load environment variables from .env file
load_dotenv()

# Corrected manifest JSON
manifest_json = """
{
    "version": "1.0.0",
    "manifest_version": 3,
    "name": "Chrome Proxy",
    "permissions": [
        "proxy",
        "tabs",
        "storage",
        "webRequest",
        "webRequestBlocking",
        "unlimitedStorage"
    ],
    "host_permissions": [
        "<all_urls>"
    ],
    "background": {
        "service_worker": "background.js"
    }
}
"""

# Corrected background JS
background_js = """
var config = {
    mode: "fixed_servers",
    rules: {
        singleProxy: {
            scheme: "http",
            host: "%s",
            port: parseInt(%s)
        },
        bypassList: ["localhost"]
    }
};

chrome.proxy.settings.set({value: config, scope: "regular"}, function() {});

function callbackFn(details) {
    return {
        authCredentials: {
            username: "%s",
            password: "%s"
        }
    };
}

chrome.webRequest.onAuthRequired.addListener(
    callbackFn,
    {urls: ["<all_urls>"]},
    ['blocking']
);
"""


# Function to create proxy authentication extension
def create_proxy_auth_extension(proxy_host, proxy_port, proxy_user, proxy_pass):
    manifest = manifest_json
    background = background_js % (proxy_host, proxy_port, proxy_user, proxy_pass)

    # Path to save the plugin
    pluginfile = 'proxy_auth_plugin.zip'

    with zipfile.ZipFile(pluginfile, 'w') as zp:
        zp.writestr("manifest.json", manifest)
        zp.writestr("background.js", background)

    return pluginfile


# Function to get ChromeDriver with proxy settings
def get_chromedriver(use_proxy=False, user_agent=None, proxy_host=None, proxy_port=None, proxy_user=None,
                     proxy_pass=None):
    chrome_options = Options()

    if use_proxy:
        pluginfile = create_proxy_auth_extension(proxy_host, proxy_port, proxy_user, proxy_pass)
        chrome_options.add_extension(pluginfile)

    if user_agent:
        chrome_options.add_argument(f'--user-agent={user_agent}')

    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-popup-blocking')
    chrome_options.add_argument('--disable-infobars')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')

    driver = uc.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    return driver


# Function to detect captcha and retry
def handle_captcha(driver):
    try:
        while True:
            captcha_text = driver.find_element(By.TAG_NAME, 'h1').text
            if "One Moment please..." in captcha_text or "Please complete the security check to access" in captcha_text:
                print("Captcha detected, please solve it manually...")
                time.sleep(5)  # Wait for the user to solve the captcha manually
            else:
                break
    except Exception as e:
        print(f"Error handling captcha: {e}")


# Function to extract details from DOM
def extract(DOM) -> dict:
    details = {}

    # Extract title
    title_el = DOM.select_one("div.primary-item-info h1.title")
    details["Titel"] = title_el.text if title_el else ""

    # Extract authors
    autors_el_list = DOM.select("div.author-list a")
    details["Autor"] = [autor.text for autor in autors_el_list]

    # Extract short description
    short_Desc_el = DOM.select_one("div.primary-item-info p.subtitle")
    details["KurzBesch"] = short_Desc_el.text if short_Desc_el else ""

    # Extract description
    desc_el = DOM.select_one('div.continue-reading-block.description-anno p')
    if not desc_el:
        desc_el = DOM.select_one('.inhalt-beschreibung .kurzbeschreibung')
    details["Beschreibung"] = desc_el.text.strip() if desc_el else ""

    # Extract reviews
    reviews_el = DOM.select_one('div.reviews')
    if reviews_el:
        avg_rating_el = reviews_el.select_one('div.review-avg div.rating')
        avg_rating = sum(1 if 'star-filled' in star['class'] else 0.5 if 'star-half-filled' in star['class'] else 0
                         for star in avg_rating_el.select('span.star')) if avg_rating_el else 0
        review_count_el = reviews_el.select_one('div.review-count')
        review_count = review_count_el.text if review_count_el else "0 Bewertungen"
        details["Rezension"] = f"Durchschnitt: {avg_rating} Sterne, {review_count}"
    else:
        details["Rezension"] = ""

    # Extract detailed information
    detail_dialog_div = DOM.select_one("div.full-details div.table-view")
    if detail_dialog_div:
        for el in detail_dialog_div.select("div.table-row"):
            dia_key_el = el.select_one("div.table-col.table-head")
            val_el = el.select_one("div.table-col:not(.table-head)")
            if dia_key_el and val_el:
                details[dia_key_el.text.strip()] = val_el.text

    # Extract image sources
    img_el_list = DOM.select("div.media-col img")
    details["Img"] = [img['src'] for img in img_el_list if img.get('src')]

    return details


# Function to save details as JSON file
def save_details_as_json(details, temp_filename='Data/temp_books.json'):
    with open(temp_filename, 'a', encoding='utf-8') as f:
        f.write(json.dumps(details, ensure_ascii=False) + "\n")


# Function to save progress
def save_progress(progress):
    with open('../Data/progress.json', 'w') as f:
        json.dump(progress, f)


# Function to load progress
def load_progress():
    if os.path.exists('../Data/progress.json'):
        with open('../Data/progress.json', 'r') as f:
            return json.load(f)
    return {}


# Function to write final JSON file from temp file
def write_final_json(temp_filename='Data/temp_books.json', final_filename='Data/all_books.json'):
    with open(temp_filename, 'r', encoding='utf-8') as temp_file:
        with open(final_filename, 'a', encoding='utf-8') as final_file:
            for line in temp_file:
                final_file.write(line)


# Function to extract book URLs from search results
def extract_book_urls_from_search(category, driver, page=1):
    book_urls = []
    try:
        search_url = f'https://www.hugendubel.de/de/search?q={category}&page={page}'
        driver.get(search_url)
        time.sleep(random.uniform(2, 4))  # Random sleep to mimic human behavior
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        book_links = soup.select('div.primary-item-info a.title')
        book_urls = ['https://www.hugendubel.de' + link['href'] for link in book_links]
    except Exception as e:
        print(f"Error extracting book URLs for category {category}, page {page}: {e}")
    return book_urls


# Function to scrape book details
def scrape_book_details(url, category, driver):
    details = {"Kategorien": [category]}
    try:
        print(f"Getting URL: {url}")
        driver.get(url)

        handle_captcha(driver)

        # Wait for the page to fully load
        WebDriverWait(driver, 30).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'body')))
        WebDriverWait(driver, 30).until(lambda d: d.execute_script('return document.readyState') == 'complete')

        # Wait for specific elements to load
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div.primary-item-info h1.title')))

        # Wait for image elements to load
        WebDriverWait(driver, 50).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div.media-col img')))

        # Parse page source with BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')

        # Extract details using BeautifulSoup
        details.update(extract(soup))
        print(details)
        return details

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {}


# Function to process a batch of books for a category
def process_category_batch(driver, category, start_index, last_scraped_url, temp_filename, already_scraped_urls):
    books_scraped = 0
    progress = load_progress()
    page = 1
    while books_scraped < 70:
        book_urls = extract_book_urls_from_search(category, driver, page)
        if not book_urls:
            break  # No more books found

        for book_url in book_urls:
            if book_url in already_scraped_urls:
                continue  # Skip already scraped book
            if last_scraped_url and book_url == last_scraped_url:
                last_scraped_url = ""
                continue  # Skip already scraped book

            details = scrape_book_details(book_url, category, driver)
            if details:
                save_details_as_json(details, temp_filename)
                books_scraped += 1
                already_scraped_urls.add(book_url)
                progress['last_index'] = start_index
                progress['last_scraped_url'] = book_url
                save_progress(progress)
            time.sleep(random.uniform(1, 3))  # Sleep to mimic human interaction

        page += 1

    return books_scraped


# Main function to run the scraper
def main():
    proxy_host = "premium-residential.geonode.com"
    proxy_port = "9000"
    proxy_user = os.getenv("GEONODE_USERNAME")
    proxy_pass = os.getenv("GEONODE_PASSWORD")
    if not proxy_user or not proxy_pass:
        print("GeoNode API key not found in environment variables.")
        return

    user_agent = UserAgent().random
    driver = get_chromedriver(use_proxy=True, user_agent=user_agent, proxy_host=proxy_host, proxy_port=proxy_port,
                              proxy_user=proxy_user, proxy_pass=proxy_pass)

    # Load categories from JSON file
    with open('categories.json', 'r', encoding='utf-8') as f:
        categories = json.load(f)

    # Load progress
    progress = load_progress()
    saved_categories = progress.get('categories', [])
    if saved_categories != categories:
        print("Categories file has changed, resetting progress.")
        progress = {'last_index': 0, 'last_scraped_url': "", 'categories': categories}

    start_index = progress.get('last_index', 0)
    last_scraped_url = progress.get('last_scraped_url', "")

    temp_filename = '../Data/temp_books.json'
    final_filename = '../Data/all_books.json'
    total_books_scraped = 0
    books_to_scrape_per_category = 100

    # Track already scraped URLs to avoid duplicates
    already_scraped_urls = set()

    for category_index, category in enumerate(categories):
        if category_index < start_index:
            continue  # Skip already processed categories

        print(f"Searching for books in category: {category}")

        category_books_scraped = 0
        while category_books_scraped < books_to_scrape_per_category:
            books_scraped = process_category_batch(driver, category, category_index, last_scraped_url, temp_filename,
                                                   already_scraped_urls)
            category_books_scraped += books_scraped
            total_books_scraped += books_scraped

            # Write temp data to final JSON file every 10 books
            if books_scraped > 0:
                write_final_json(temp_filename, final_filename)
                os.remove(temp_filename)  # Clear the temp file

            if books_scraped == 0:
                break  # No more books found in this category

            if category_books_scraped >= books_to_scrape_per_category:
                break  # Stop if we've scraped the desired number of books

    driver.quit()

    print(f"Scraping completed. Total books scraped: {total_books_scraped}")


if __name__ == "__main__":
    main()
