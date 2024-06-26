from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from time import sleep
from selenium.webdriver.chrome.options import Options
import argparse
parser = argparse.ArgumentParser()
parser.add_argument("--headless",default=False)
args=parser.parse_args()
#Unused

# dies Zeile benötigt einen Chrome driver der in env-var bekannt ist
# alternativ:   driver = webdriver.Chrome('./chromedriver') <- wenn driver in gleichen Ordner ist


my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
my_user_agent="##Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
# Set up Chrome options if you want headless
chrome_options = Options()
if args.headless:
    chrome_options.add_argument("--headless")
#doesn't work 
# chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
# chrome_options.add_experimental_option("useAutomationExtension",False)

# Set the custom User-Agent
chrome_options.add_argument(f"--user-agent={my_user_agent}")
chrome_options.add_argument(f"--disable-blink-features=AutomationControlled")

chrome_options.arguments
driver = webdriver.Chrome(chrome_options)

driver.get("https://www.python.org")
print(driver.title)
search_bar = driver.find_element( By.ID,"id-search-field")
search_bar.clear()

sleep(2)
print( 'Am I a webdriver?',driver.execute_script(' console.log(`Am I a webdriver? `,navigator.webdriver);return navigator. webdriver '))


print( 'useragent?',driver.execute_script(' console.log(`useragent`,window.navigator.userAgent);return window.navigator.userAgent '))

sleep(10)

#search_bar.send_keys("getting started with python")
#search_bar.send_keys(Keys.RETURN)
print(driver.current_url)
sleep(4)

driver.close()