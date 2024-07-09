### Daniels Scraper

# My final dataset is located in "Formating/danielBooks.jsonl" (the "danielBooksRestrictedProps.jsonl" has all extra props thrown out)


# Scraper


I scrape my data with python, BeautifulSoup and Selenium 
	pip install beautifulsoup4
	pip install selenium
To Make Selenium run you need a Chrome Webdriver (https://sites.google.com/chromium.org/driver/downloads)
and need to make it public in your enviroment-path variable so that it can start

There is a Jupyter notebook with more detailed explanitions of my code. You can run this. It tell you when the scraper start.
(Jupyter notebook hasn't the take_article from Sitempa function)
But I also have python comandline script.

I have four python scripts for my scraping (they are all in this current folder)
1 for Utility:
	scraper_helper.py is only a collection for utility function (Saveing/Loading/Deciding if GermanBook )
3 are comandline scripts:

	take_article.py:
	python take_article.py -o ArticleUrl/pages1_6.txt -N  6
	
	This file opens with Seelenium a browser and collects from the sitemaps urls for article pages
	there are ~50 pages with with each 50000 article pages (normaly 3 or so are enough, I only scraped on the first page)
	the -N tells how many to fetch. 
	So a '\n' seperated url list is generated and saved to in -o given Path, so my scraper  can work with them later.
	I think the articles pages migth change sligthly, but I don't know, and with this script you can fetch the most up-to-date version
	(I store my url-list in from the Sitemap in the folder "ArticleUrl")


	extract_article_url_search.py:
	python extract_article_url_search.py -u https://www.thalia.de/suche?sq=zelda -o path_to_out_file_zelda

	Generates a url-list from a search url. I you go to thalia and type something in the search bar, most searches correspond to an url and 
	they display a scroll-down-list with a "Weitere Laden" button at the bottom.
	When this condition is meet you can run this script, which presses with Selenium the "Weitere Laden" button up to a certain max Times and then 
	extracts from all viewed articles in the list the url and saves it to a file. (I store them mostly in "TestUrl")
	This allows to scrape books that are already categorized or more targeted. And the most of the category urls I gathered from the sitemap 
	(TestUrl/categoriesurl.txt) also have the scrollbar and can be used


	scraper.py:
	python scraper.py --urls "TestURL/sucheXsqXpokemon.txt" -o "DataDemonstration/pokemon.jsonl"  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

	The actual scraper. Take a '\n' url file loads it and the searches every book site. It already filters out "Fremdsprachige Bücher"|"Spielwaren"|"Kalender"
	cause my article scraper scrapes over all articles. It also downloads the images and saves them partioned in a folder with the -o name+"images".
	And it stores a pointer to the last visited url and saves it in a file. If it detect such a pointer it tries to continue where it stopped.
	(from experience I can say that once it starts it has no Bot Detection Problem and can run multiple hours, but  after the 3-5 restart on the same url with same user-agent it may stop working you need to change the useragent)

The bulk of my scraped data comes from starting to scrape all article pages. It's stores in "ArticleData". 
But I only visited 21971 different article pages and detected ~14000 (no deduplication) from a total of 50000 from 
article page 1. It could be scraped more, I already have 250000 artcle pages in "ArticleUrl/pages1-4.txt", and they can be combined 
with one of my combination script.
The images are still in my old repo(link in global readme), I didn't copy them to save space.


# Formating & Visualisation  
In the folder "Formating" are javascript node.js console scripts to format/combine our data.
You can run them from the commandline.

	node normalise.mjs  dataset_from_me_1.jsonl dataset_from_me_2.jsonl dataset_from_me_3.jsonl --out_file normed_auth_relaes.jsonl
	
	this script takes a raw scraped jsonl dataset from me and applies additonal regularisation to "Kaetegorien" "Autors" "Produktart", deduplication
	and makes it, so that my data conforms with the agreed fromat	

	node combine.mjs    danielBooks.jsonl  ..\..\Rassul_Chsheriyazdanov_Scrapers\Data\all_books_normalized.json "mouna.jsonl"     -o combined_D_R_M.jsonl
	
	Combines multiple Datasets in agreed form and deduplicates them

	
	node split.mjs  ..\..\CombinedDataSet\All\combined_D_R_M.jsonl -N 500   -o ..\..\CombinedDataSet\ByRelease\combined_D_R_M.jsonl
	
	Makes the spliting and sorting by realese


In folder  "Visuallsition" you find a python script that loads a normed jsonl-file and plot it with mathplot

	example: 
	python releaseYearPlot.py -i ..\..\CombinedDataSet\All\combined_D_R_M.jsonl --since 1970
	^~~ this plots a graph of amount of books per realese year
OPtions how to plot different things can be found at the start of the file


# ----Moodle Abgabe

### German Book Data 1 thalia -moodle submission
----------------------------------------
## why chose I this data source?

	1. It was agreed which groups use which websides. In my group it was 
	2. The thalia webside contains a lot of book which garantees finding enough data.
	3. I found out eary that in the robots.txt of the thalia site are urls to the sitemap,
	 that links to xml that contains all article urls. The first page of all article urls can be found in 
	 ./ArticleUrl/page1.txt. It alone contains 49.999 entries. That made scraping thalia promising.
	 there is also a link to all categorie urls (Also downloaded and extracted, look in ./TestUrl/categoriesurl.txt)

## which types of bots does the robots.txt allow and disallow?

	It does not explictly disallow bot but it restricts certain url paths. 
	It disallows access for user account managment related paths like '/konto/' | '/shop/home/kunde/'
	also login  /shop/home/login/
	customer review  /shop/home/kundenbewertung/
	things that involve money  /shop/home/warenkorb/add
	and strangely also  /suche/v1/ 
		(the /suche/v1 isn't even the  url when you use the search on the webside)

	I use urls like https://www.thalia.de/shop/home/artikeldetails/A1063615999 ,
	(relevant path: /shop/home/artikeldetails ) and they are't prohibited so I'm fine