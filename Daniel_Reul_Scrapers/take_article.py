from selenium import webdriver
from selenium.webdriver.chrome.webdriver import WebDriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from time import sleep
from selenium.webdriver.chrome.options import Options
import argparse

from scraper_helper import declineCookies, dragonMsg

# bsp use>> python take_article.py --out_file ArticleUrl/pages1_6.txt -N  6

parser = argparse.ArgumentParser(description='this programm opens the thalia base page and the fetches with javascript the site_map article pages up to a given number.Then writes them to a file')

parser.add_argument('-o', '--out_file',default="TestUrl/artcle_url.txt")
parser.add_argument('-N', '--up_to_page',default=4)

args = parser.parse_args()
print(f'Args: \n\tout_file: { args.out_file}\n\tup_to_page: { args.up_to_page}')



my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
# Set up Chrome options if you want headless
chrome_options = Options()
# useHeadless=True # currently crashes with headleess true
# if useHeadless: chrome_options.add_argument("--headless")

chrome_options.add_argument(f"--disable-blink-features=AutomationControlled")

# Set the custom User-Agent
#chrome_options.add_argument(f"--user-agent={my_user_agent}")

def take_sitemap_articles(output_file:str="default.txt",up_to_page=4):
    browser:WebDriver= webdriver.Chrome(chrome_options)
    browser.get('https://thalia.de')
    
    print( 'useragent?',browser.execute_script(' console.log(`useragent`,window.navigator.userAgent);return window.navigator.userAgent '))
    print( 'Am I a webdriver?',browser.execute_script(' console.log(`Am I a webdriver? `,navigator.webdriver);return navigator. webdriver '))
    sleep(1)
    declineCookies(browser)
    sleep(1)
    browser.set_script_timeout(200)
    print(f'this will need {up_to_page*2} seconds...')
    urls= browser.execute_script(r''' 
const all_urls=[]
const sleep= n=>new Promise(r=>setTimeout(_=>r(),n))
for(let i=1;i<=%s&&i< 50 ;i++){
    let res=await fetch('https://www.thalia.de/sitemaps/artikel/artikel_sitemap_'+i+'.xml')
    await sleep(2000);
    let text=await res.text() ;
    if(res.status>299){break};
    let xml=(new DOMParser("","text/html")).parseFromString(text,'text/html');
    let page_urls=[...xml.querySelectorAll('loc')].map(x=>x.innerText);
    all_urls.push(...page_urls);
}
return    [...new Set(all_urls)].join("\n")                                                                      
''' %( up_to_page ) )
    # print(cat_urls)
    used_out_file=output_file
    
   
    print(f"found urls were written to {used_out_file}")
    with open(used_out_file, 'w',encoding= "utf-8") as file:
        file.write(urls)
    
    browser.close()
    sleep(10)
    dragonMsg()
    print("finshed succesfully\n")  
take_sitemap_articles(args.out_file,args.up_to_page)