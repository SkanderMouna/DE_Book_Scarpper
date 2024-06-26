import os
import time
import json
import random
import zipfile
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
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

    driver = uc.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    return driver

# Function to fetch main categories from the homepage
def fetch_categories(driver, base_url, limit=20):
    categories = []
    try:
        driver.get(base_url)
        time.sleep(random.uniform(2, 4))  # Random sleep to mimic human behavior
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        category_elements = soup.select('ul.nav.nav-vertical li.nav-item a.nav-link')
        for element in category_elements[:limit]:  # Limit to specified number of categories
            category_name = element.text.strip()
            if category_name:
                categories.append(category_name)
    except Exception as e:
        print(f"Error fetching categories: {e}")
    return categories

def main():
    base_url = 'https://www.hugendubel.de/de/category/1/buecher.html'

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

    categories = fetch_categories(driver, base_url)

    # Save categories to a JSON file
    with open('categories.json', 'w', encoding='utf-8') as f:
        json.dump(categories, f, ensure_ascii=False, indent=4)

    driver.quit()
    print(f"Fetched and saved {len(categories)} categories to categories.json.")

if __name__ == "__main__":
    main()
