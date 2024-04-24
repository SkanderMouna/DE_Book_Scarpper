from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from time import sleep
#Unused

# dies Zeile benötigt einen Chrome driver der in env-var bekannt ist
# alternativ:   driver = webdriver.Chrome('./chromedriver') <- wenn driver in gleichen Ordner ist
driver = webdriver.Chrome()

driver.get("https://www.python.org")
print(driver.title)
search_bar = driver.find_element( By.ID,"id-search-field")
search_bar.clear()
search_bar.send_keys("getting started with python")
search_bar.send_keys(Keys.RETURN)
print(driver.current_url)
sleep(4)

driver.close()