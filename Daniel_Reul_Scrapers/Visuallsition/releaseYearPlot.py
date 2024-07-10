import json
import matplotlib.pyplot as plt
from collections import Counter
import datetime
import argparse
import re

'''
written by Daniel (and ( for math plot code) help of Chat GPT )


Math plot
Can take any jsonl
-t says what to plot 

no -t ->  -t release ->realese years
Cause it only uses the year it also works with Mounas occasionnly "Juil 2021" Date Format

python releaseYearPlot.py -i ..\..\CombinedDataSet\All\combined_D_R_M.jsonl --since 1990

-t category  -> By Categories

#Plot Daniels Books by Categorien (Are already sligthly preprosed to a manually preselect Kategory)
python releaseYearPlot.py  -t category --title " (Thalia)"  --includeNo True  -i  ..\Formating\danielBooks.jsonl

#Plot Rassul (@Rassul mayby insert a better Title for the diagramm?)
python releaseYearPlot.py  -t category --title " (Hugendubel)"  --includeNo True --catLimit 30  -i  ..\..\Rassul_Chsheriyazdanov_Scrapers\Data\all_books_normalized1.json

#Plot Mouna 
python releaseYearPlot.py  -t category --title " (Perlentaucher,Kulturkaufhaus)" --catLimit 30  --includeNo True  -i  ..\Formating\mouna_final.jsonl


-t producttyp 
all makes no sense cause e. g. are different cat Ebook and EBOOK 
python releaseYearPlot.py  -t producttyp  --title " (Combined)" --catLimit 30  --includeNo True  -i  ..\..\CombinedDataSet\All\combined_D_R_M.jsonl 

python releaseYearPlot.py  -t producttyp  --title " (Thalia)" --catLimit 30  --includeNo True  -i  ..\Formating\danielBooks.jsonl 
python releaseYearPlot.py  -t producttyp  --title " (Perlentaucher,Kulturkaufhaus)" --catLimit 30  --includeNo True  -i  ..\Formating\mouna_final.jsonl
python releaseYearPlot.py  -t producttyp  --title " (Hugendubel)" --catLimit 30  --includeNo True  -i   ..\..\Rassul_Chsheriyazdanov_Scrapers\Data\all_books_normalized1.json

-t author
python releaseYearPlot.py  -t author  --title " (Combined)" --catLimit 30 --logScale True  --includeNo True    -i  ..\..\CombinedDataSet\All\combined_D_R_M.jsonl 
'''

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--in_file", default="default")
parser.add_argument("-u", "--until", default=2024,type=int)
parser.add_argument("-s", "--since", default=None, type=int)
parser.add_argument("-t", "--type", default="release")
parser.add_argument( "--title", default="")
parser.add_argument( "--includeNo", default=False)
parser.add_argument( "--includeRest", default=True,type=bool)
parser.add_argument( "-L","--catLimit", default=29,type=int)
parser.add_argument( "--logScale", default=False,type=bool)

args = parser.parse_args()


def load_books_from_jsonl(file_path):
    books = []
    with open(file_path, "r", encoding="utf-8") as file:
        for line in file:
            book = json.loads(line.strip())
            books.append(book)
    print("len books:", len(books))
    return books


def extract_year_from_date(date_str):
    if date_str == None:
        return None
    try:
        # date = datetime.datetime.strptime(date_str, "%d.%m.%Y")
        # return date.year
        year = re.split("\\.| ", date_str)[-1]
        year = int(year)
        if year > args.until:
            return None
        if args.since != None and year < args.since:
            return None
        return year
    except ValueError:
        return None


def count_books_per_year(books):
    years = [extract_year_from_date(book.get("Erscheinungsdatum")) for book in books]
    # Filter out None values
    years = [year for year in years if year is not None]
    return Counter(years)


def plot_books_per_year(book_counts,books):
    years = sorted(book_counts.keys())
    counts = [book_counts[year] for year in years]

    plt.figure(figsize=(10, 6))
    plt.bar(years, counts, color="skyblue")

    # Set major ticks every 10 years and minor ticks every 5 years
    plt.gca().set_xticks(range(min(years), max(years) + 1, 5))
    # plt.gca().set_xticks(range(min(years), max(years) + 1, 5), minor=True)

    plt.xlabel("Year")
    plt.ylabel("Number of Books")
    plt.title(
        "Number of Books Published Per Year"
        + (f" since {args.since}" if args.since != None else "")+f" N={len(books)}"
    )
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

no_cat="keine"
rest_cat="sonstige"

def count_books_by_category(books,prop='Kategorien'):
    category_counts = Counter()
    for book in books:
        categories = book.get(prop, [])
        if type(categories)== str:
            categories=[categories ] if categories!="" else  []
        if categories:
           
            for category in categories:
                category_counts[category] += 1
        else:
            if args.includeNo: category_counts[no_cat] += 1
    # return category_counts
            
    # Sort categories by count and keep only the top N, the rest will be grouped into "sonstige"
    most_common = category_counts.most_common(args.catLimit)
    limited_category_counts = Counter(dict(most_common))
    
    if args.includeRest:    
        other_count = sum(count for category, count in category_counts.items() if category not in dict(most_common))
        if other_count > 0 :
            limited_category_counts[rest_cat] = other_count

    return limited_category_counts

def plot_books_by_category(category_counts,books,prop='Kategorien'):
    categories = list(category_counts.keys())
    counts = list(category_counts.values())

    plt.figure(figsize=(10, 6))
    
    # Define custom colors
    specialMark= [no_cat,rest_cat]
    colors = ['skyblue' if category not in specialMark else 'orange'  for category in categories]
    plt.barh(categories, counts, color=colors)
    plt.xlabel('Number of Books')
    plt.ylabel(prop)
    
    # Adjust the font size of the y-axis labels
    plt.yticks(fontsize=8)
    # Add padding between the labels
    plt.gca().tick_params(axis='y', pad=5)

    plt.title(f'Number of Books by {prop}'+(args.title)+f" N={len(books)}")
    plt.tight_layout()
    plt.show()

def count_authors_per_book(books):
    authors_per_book = [len(book.get('Autor', [])) for book in books]
    return authors_per_book

def plot_authors_per_book(authors_per_book,books):
    plt.figure(figsize=(10, 6))

    # Plotting the histogram
    plt.hist(authors_per_book, bins=range(0, max(authors_per_book) + 2), align='left', color='skyblue', edgecolor='black')
    
    plt.xlabel('Number of Authors')
    plt.ylabel('Number of Books')
    plt.title('Distribution of Number of Authors per Book')
    plt.title(f'Distribution of Number of Authors per Books'+(args.title)+f" N={len(books)}")
    
    if args.logScale: plt.yscale('log')
    plt.xticks(range(0, max(authors_per_book) + 1))
    
    plt.tight_layout()
    plt.show()
def main(input_file):
    books = load_books_from_jsonl(input_file)
    # print([book['Erscheinungsdatum'] for  book in books])
    
    if args.type == 'release':
        book_counts = count_books_per_year(books)
        plot_books_per_year(book_counts,books)
    elif args.type == 'category':
        category_counts = count_books_by_category(books,'Kategorien')
        print(category_counts)
        plot_books_by_category(category_counts,books,'Categories')
    elif args.type == 'producttyp':
        product_counts = count_books_by_category(books,'Produktart')
        print(product_counts)
        plot_books_by_category(product_counts,books,'Produkt-Type')
    elif args.type == 'author':
        authors_per_book = count_authors_per_book(books)
        plot_authors_per_book(authors_per_book,books)



# Example usage
input_file = args.in_file
print(input_file)
main(input_file)
