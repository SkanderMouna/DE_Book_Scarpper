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