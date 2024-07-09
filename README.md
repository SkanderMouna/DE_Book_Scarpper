# Generall Information
In the folder CombinedDataSet you find our combined Dataset and 
a version that is partitioned by release in smaller chunks.
In each of the folders named after us, you will find to code for the beloning person.
In each subfolder you will find an instruction how to use it

# DE_Book_Scarpper
For our dataset we going to use JSON files following this structure below.
Note: all object content should be in german language
## Book Object Structure
```bash
{
"Titel": "book title",
"Beschreibung":"long description of the book";
"Autor":["ich bin den Author","Author 2"], //as an array
"Img":["cover image url","second image url"],
"ISBN":"",
"Produktart":"Taschenbuch"||"Gebunden",
"Erscheinungsdatum":"05.05.2022",
"Kategorien": ["fantasy"],
"Verlag":"the publisher",
"Auflage":"the version of the book",
}
```




## German books websites:
* `Daniel`  [GitHub Repository](https://github.com/dragon-17/Book_Scraper)
   (In this repo you will find additionally the downloaded images from my scraper (I know it wasn't the task, but I have them anyway), they weren't copied to this repo to save space.
   The path to the image a book belongs to can be found in the key "imgLoc" (only for books by me), most are in "ArticleData/page1_images" )
  *  [Thalia](https://www.thalia.de/) 
* `Mouna SKANDER` [GitHub Repository](https://github.com/SkanderMouna/GermanBooksScrapersDeepLearning.git)
  *  [Kulturkaufhaus](https://www.kulturkaufhaus.de/en/start) 
  *  [Perlentaucher](https://www.perlentaucher.de/)
  *  [Bücher](https://www.buecher.de/)
  From each website, a JSON file will be saved, and the final scraped data file is named ll.json, in which I have fused all the scraped data and made some cleaning and modifications.
* `Rassul` [GitHub Repository]()
  *  [Hugendubel](https://www.hugendubel.de/de/) 



