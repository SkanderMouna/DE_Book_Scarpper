import argparse
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from time import sleep
import typing
import pickle
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.webdriver import WebDriver
import random
import json
import re
import urllib
import base64
import os

from scraper_helper import declineCookies, downloadImage, dragonMsg, extract, loadURLs, save, testIsGermanBook, writeCurIndex

#bsp use >> python extract_article_url_search.py -u https://www.thalia.de/suche?sq=zelda

parser = argparse.ArgumentParser(
                    prog='Search article or category Extracter',
                    description='This script extracts from an thalia category url or an thalia search url all articles that show up to an upperbound\n\nThe default without args values scrape a example page.  \n\nif the out_file is in a Folder the folders must exists',
                    epilog='Help End')

parser.add_argument('-u', '--url',default="https://www.thalia.de/suche?sq=anime%2C+horror" )      # option that takes a value
parser.add_argument('-o', '--out_file',default='default')

args = parser.parse_args()
print(f'Args: \n\turl: {args.url} \n\tout_file: { args.out_file}')



my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
# Set up Chrome options if you want headless
chrome_options = Options()
# useHeadless=True # currently crashes with headleess true
# if useHeadless: chrome_options.add_argument("--headless")

chrome_options.add_argument(f"--disable-blink-features=AutomationControlled")
# Set the custom User-Agent
#chrome_options.add_argument(f"--user-agent={my_user_agent}")


# goes to a kategorie site and clicks the "weitere laden" button until no more remaining click are there
# and saves all link of saerch results to a file
def collect_urls(search_url:str,output_file:str="default"):
    browser:WebDriver= webdriver.Chrome(chrome_options)
    browser.get(search_url)
    sleep(1)
    declineCookies(browser)
    sleep(1)
    browser.set_script_timeout(200)
    cat_urls= browser.execute_script(r''' 
let $=document.querySelector.bind(document);
let $A=document.querySelectorAll.bind(document);
const sleep= async(m_time)=> await new Promise(resolve => setTimeout(resolve,1000*m_time));
let weiter_laden=$("button[interaction=weitere-ergebnisse-laden]")
weiter_laden.click();
await sleep(3);
weiter_laden.click();
await sleep(3);
let amount=$(".element-text-standard-strong.ergebnisanzeige")
let amountsar=   amount.innerText.split(/\D+/).slice(0,2).map(x=>+x)
let remaining=amountsar[1]-amountsar[0];
let max_click=20;
while(max_click>0&&remaining>0){
           max_click--;     
weiter_laden.click();                      
await sleep(1);
amountsar=   amount.innerText.split(/\D+/).slice(0,2).map(x=>+x)
remaining=amountsar[1]-amountsar[0];
}                                                                            
let all_links=[...$A("a[caption=suchergebnis-klick]")].map(x=>x.href)  
return    [...new Set(all_links)].join("\n")                                                                      
''')
    # print(cat_urls)
    used_out_file="TestUrl/"
    if output_file=="default":
        category=search_url.split("/")[-1]
        if category=="":category=  search_url.split("/")[-2]
        category= (re.sub("[^A-Za-z0-9]","X", category))[0:30]
        used_out_file+=category+".txt"
    else:
        used_out_file=output_file
    print(f"found urls were written to {used_out_file}")
    with open(used_out_file, 'w',encoding= "utf-8") as file:
        file.write(cat_urls)
    
    browser.close()
    sleep(10)
    dragonMsg()
    print("finshed succesfully\n")  
    
    
collect_urls(args.url,args.out_file)