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


def printInfo(browser:WebDriver):
    print(browser.title)
    print(browser.current_url)
    driver_ua = browser.execute_script("return navigator.userAgent")
    print("User agent:",driver_ua)

def clickDetailsBut(browser:WebDriver):
    #detail_but= browser.find_element(By.CSS_SELECTOR,"button[data-dialog='details']")
    #click on detail button with js
    outerButHTML_str:str = browser.execute_script(r"let detailbut=document.querySelector('button[data-dialog=\'details\']') ;console.log(detailbut); detailbut.click(); detailbut.outerHTML")
    print(outerButHTML_str)
def declineCookies(browser:WebDriver):
    #browser.execute_script(r"let cookie=document.querySelector('#usercentrics-root');let but=cookie.shadowRoot.querySelector('button[data-testid=\"uc-deny-all-button\"]').click();return but.outerHTML")
    browser.execute_script(r"try{ let cookie=document.querySelector('#usercentrics-root');let but=cookie.shadowRoot.querySelector('button[data-testid=\"uc-deny-all-button\"]').click();return but.outerHTML}catch(e){console.log('error at accepting cookies ;ignore it')}")


def saveBase64Img(base_input_64="",dst="img.png"):
    img = base64.b64decode(base_input_64[22:])
    with open(dst, 'wb') as f:
        f.write(img)

def downloadImage(url,browser,saveName="savedImg"):
    save_script=R''' try{
    //let src=document.querySelector("image-zoom picture source, tab-panel picture source").srcset
    function urlContentToDataUri(url){
    return  fetch(url)
            .then( response => response.blob() )
            .then( blob => new Promise( callback =>{
                let reader = new FileReader() ;
                reader.onload = function(){ callback(this.result) } ;
                reader.readAsDataURL(blob) ;
            }) ) ;
}
    let base64=await urlContentToDataUri("%s");
    return base64;
    }
    catch(e){return ""}
'''  % (url)
    base_in_64=browser.execute_script(save_script)
    #print(base_in_64[0:400])
   # with open("base64debugdump", 'w') as f:
    #    f.write(base_in_64)
    if base_in_64 !="":
        saveBase64Img(base_in_64,saveName)
        
        
        
#testobj={"Titel": "Wilhelm Brinkmeyers Abenteuer von ihm selbst erzählt", "Autor": ["Rudolf Huch"], "KurzBesch": "", "ExtraInfo": "Buch (Taschenbuch)", "Kategorien": "StartseiteGesc//Bücher/Romane&Erzählungenenglisch/Literatur", "Beschreibung": "Eheu! Mit diesem Weheruf aus dem klassischen Altertum pflegte ich während meiner Gymnasialzeit das göttliche Dreigespann des Phaeton zu begrüßen, jenes verwegenen Jünglings, der sich, wie uns Ovid überliefert, dereinst der Lenkung des Sonnenwagens unterwunden hat, aber weil ihm die Kräfte des Apollon fehlten, auf das elendste dabei umgekommen ist. Eine Erzählung, die mir in dem derzeitigen philosophischen Abschnitte meines Lebens höchst bedeutungsvoll erscheint, als ein Symbolum der allermeisten menschlichen Bestrebungen, ja vielleicht des menschlichen Lebens überhaupt. Wenn wir nämlich das von jenem Phaeton befahrene Himmelsgewölbe dem Tummelplatze dieser Erde und sein Gespann unserm Schicksal gleichsetzen, so ergibt sich, daß wir uns wohl alle in grüner Jugend vermessen, das Gefährte nach unserm Willen über die Bahn zu lenken, da wir doch nach einiger Strecke erkennen müssen, sofern wir nicht bis zum Ende in geistiger Blindheit beharren, daß vielmehr das Gespann uns führt, wohin es ihm beliebt. Auch hinsichtlich der Gleichsetzung unsers Schicksals mit einem durchgehenden Gespann erscheint mir der Vergleich keineswegs zu hinken. Irgendwas von Sinn und Verstand vermag ich in dem Walten der Schicksalsmacht wenigstens in meinem Leben nicht zu entdecken. Was nun schließlich das klägliche Ende des Unternehmers anlangt, so ist, solange die Welt steht, noch keines Menschen Fahrt anders ausgegangen als mit dem Tode. ¿ Der aufmerkende Leser wird nicht erst der ausdrücklichen Versicherung bedürfen, daß mein Weheruf nicht etwa einer Abneigung wider die Wissenschaften entsprang. Das war so wenig der Fall, daß ich schon von der Obertertia an beflissen war, mich auf mein erwähltes Fach, Theologie und Philologie, vorzubereiten, indem ich Sextanern und Quintanern, deren Eltern mich darum anließen, gegen ein geringes Taschengeld Nachhilfestunden erteilte.", "Rezension": "", "Einband": "Taschenbuch", "Erscheinungsdatum": "09.01.2023", "Verlag": "Culturea", "Seitenzahl": "204", "Maße (L/B/H)": "22/17/1,2 cm", "Gewicht": "326 g", "Sprache": "Deutsch", "ISBN": "979-10-419-0291-0", "Img": ["https://images.thalia.media/00/-/adcf6c47e8474d2198f3dca177c75c6e/wilhelm-brinkmeyers-abenteuer-von-ihm-selbst-erzaehlt-taschenbuch-rudolf-huch.jpeg"], "url": "https://www.thalia.de/shop/home/artikeldetails/A1067788334"}
def testIsGermanBook(details)->bool:
    if details["Titel"]=="":return False #possible empty page
    book_reg="fremd|Musik|kalendar|Kalend|schreibwaren|Geschenk|Spielwaren|Spiel|eReader|Zubehör|Englisch"
    x=re.search(book_reg,details['ExtraInfo']+details['Kategorien'],flags=re.IGNORECASE)
    return (True if x==None else  False)
#testIsGermanBook(testobj)

def extract(DOM)->dict:
        
    details={}
    
    title_el= DOM.select_one ("section.basis-informationen h1")
    details["Titel"] = title_el.text if title_el != None else ""

    autors_el_list= DOM.select("a.autor-name")
    details["Autor"] = [autor.text for autor in autors_el_list ]

    short_Desc_el= DOM.select_one ("section.basis-informationen .untertitel")
    details["KurzBesch"] = short_Desc_el.text if short_Desc_el != None else ""

    extra_Info_el= DOM.select_one ("section.basis-informationen ul+ p")
    details["ExtraInfo"] = extra_Info_el.text if extra_Info_el != None else ""

    categories_el= DOM.select_one ("ul.breadcrumb-list")
    details["Kategorien"] ="".join(  [cat.strip() for cat in categories_el.text.split()] ) if categories_el != None else ""


    desc_el= DOM.select_one ('dialog[data-dialog-name="zusatztexte"] section.zusatztext div')
    if desc_el ==None: desc_el= DOM.select_one ('.inhalt-beschreibung .kurzbeschreibung')
    details["Beschreibung"] = desc_el.text.strip() if desc_el != None else ""
    
    review_el= DOM.select_one('dialog[data-dialog-name="zusatztexte"] section.zusatztext-gruppe p')
    details["Rezension"] = review_el.text if review_el != None else ""

    detail_dialog_div= DOM.select_one("dialog[data-dialog-name='details'] div.artikeldetails ")
    for el in  detail_dialog_div.find_all("section") if detail_dialog_div!=None else [] :
            dia_key_el=el.find('h3', {'class': 'detailbezeichnung'})
            val_el=el.select_one(".single-value, a")
            if dia_key_el !=None  and val_el != None:
                details[dia_key_el.text.strip() ]=val_el.text

    img_el_list= DOM.select("image-zoom picture source, tab-panel picture source")
    details["Img"] = [img['srcset'] for img in img_el_list ]
    
    #print(details)
    return details
# data=extract(soup)    


def save(obj:dict[str,str] ,path:str="Data/book_data.1.0"):
    if obj==None: return
    with open(path, 'a',encoding= "utf-8") as file:
        json.dump(obj, file,ensure_ascii=False)
        file.write("\n")
#save(data)
def pretty(d, indent=0):
   for key, value in d.items():
      print('\t' * indent + str(key))
      if isinstance(value, dict):
         pretty(value, indent+1)
      else:
         print('\t' * (indent+1) + str(value))
#pretty(data)
def loadURLs(path:str="TestUrl/1000_test_Urls.txt"):
    with open(path, 'r',encoding= "utf-8") as file:
        contents = file.read()
        return contents.split("\n") if contents!=None else []
#urlList=loadURLs()
#print(len( urlList),urlList[0:10],"...",urlList[-10:],'\n',random.choice( urlList) )
def dragonMsg(sep:str="|#|"):
    print( sep.join([f'\x1b[{90+(x%8)}m\U0001f409\ufe0e' for x in range(0,10)]) ,"\n\n"+3*"\t"+"\x1b[3;37m| (OvO) |\x1b[m" )
def writeCurIndex(path,index):
    with open(path, 'w',encoding= "utf-8") as counterfile:
                counterfile.write(str(index))