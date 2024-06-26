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


parser = argparse.ArgumentParser(
                    prog='Scraper',
                    description='Scrapes books of thalia.\n\nThe default without args values scrape a example page.  \n\nif the out_file is in a Folder the folders must exists',
                    epilog='Help End')

parser.add_argument('-u', '--urls',default="TestURL/Other10_Url.txt" )      # option that takes a value
parser.add_argument('-o', '--out_file',default="DataDemonstration/Other10_UrlNext.jsonl")

args = parser.parse_args()
print(f'Args: \n\turls: {args.urls} \n\tout_file: { args.out_file}')



my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
my_user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0"
# Set up Chrome options if you want headless
chrome_options = Options()
# useHeadless=True # currently crashes with headleess true
# if useHeadless: chrome_options.add_argument("--headless")

chrome_options.add_argument(f"--disable-blink-features=AutomationControlled")
# Set the custom User-Agent
#chrome_options.add_argument(f"--user-agent={my_user_agent}")



def scrape(url_path:str,output_file:str):
    cur_url_index=0
    cur_output_index=0
    out_baseName=re.sub('.jsonl',"",output_file)
    counterfile_path=out_baseName+"_cur_pointer.txt"
    image_folder=out_baseName+"_images/"
    os.makedirs(image_folder,exist_ok=True)
    try:
        scrape_urls = loadURLs(url_path)
        print(f"urls length {len(scrape_urls)} {scrape_urls[0:5]} ...{scrape_urls[-5:]}")
        if os.path.exists(counterfile_path):
            with open(counterfile_path,'r',encoding= "utf-8")  as counterfile:
                content=counterfile.read()
                cur_url_index=int(content.split('\n')[0])
            print(f"Existing index detected start at {cur_url_index}")
        else:
            writeCurIndex(counterfile_path,cur_url_index)
        if os.path.exists(output_file):
            with open(output_file,'r',encoding= "utf-8")  as file:
                linenumbers=len(file.readlines())
                cur_output_index=linenumbers
            print(f"Output file has already content continue at {cur_output_index}")    
    except Exception as e:
        print(e,"something went wrong aborted")
        return

    browser:WebDriver= webdriver.Chrome(chrome_options)
    print(f"Start url is {scrape_urls[cur_url_index]}")
    browser.get(scrape_urls[cur_url_index])
    sleep(3)
    declineCookies(browser)
    sleep(2)

    error_counter=0
    for current_url in scrape_urls[cur_url_index:]:
        try:
            if(current_url== ""):cur_url_index+=1;continue
            if(cur_url_index!=0):
                #!!! important
                sleep(3+ 1*random.random())
                browser.execute_script(f'window.location="{current_url}"')
                sleep(1)
            
            cur_html= browser.page_source
            cur_DOM=BeautifulSoup(cur_html,"html.parser")
            extr_dat=extract(cur_DOM)
            extr_dat["url"]=current_url

            #print("Page title",browser.title,"\n",extr_dat)
            isABook=testIsGermanBook(extr_dat)
            if isABook:
                cur_output_index+=1
                booksPerFolder=100
                small_index=(cur_output_index%booksPerFolder)
                folder_nr=cur_output_index-small_index
                image_folder_kat=image_folder+str(folder_nr)
                title_clean= (re.sub("[^A-Za-z0-9]","X",  extr_dat['Titel']))[0:20]
                extr_dat['imgLoc']=f"{image_folder_kat}/{small_index}-0-{title_clean}.jpeg"
                save(extr_dat,output_file)
                os.makedirs(image_folder_kat,exist_ok=True)
                for_loop_counter=0
                for img_url in extr_dat['Img']:
                    fileName= f"{small_index}-{for_loop_counter}-{title_clean}.jpeg"
                    downloadImage(img_url,browser, image_folder_kat+"/" +fileName)
                    # sleep(2.32+0.3*random.random()) #diable sleep for images
                    for_loop_counter+=1
        except:
            error_counter+=1
            print(f"something went wrong at {current_url}-- skiped to next err_count:{error_counter}")  
            if error_counter>40: print("abour err_count to high"); return
            
        cur_url_index+=1
        writeCurIndex(counterfile_path,cur_url_index)
      
    browser.close()
    #delete the pointer to the current url file
    if os.path.exists(counterfile_path): os.remove(counterfile_path)
    dragonMsg()
    print("finshed succesfully\n")    
    
scrape(args.urls,args.out_file)