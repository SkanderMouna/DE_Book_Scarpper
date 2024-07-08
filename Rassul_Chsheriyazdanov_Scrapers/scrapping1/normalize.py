import json
from datetime import datetime

german_to_english_months = {
    "Januar": "January", "Februar": "February", "März": "March",
    "April": "April", "Mai": "May", "Juni": "June",
    "Juli": "July", "August": "August", "September": "September",
    "Oktober": "October", "November": "November", "Dezember": "December"
}

def normalize_date(input_file, output_file):
    # Load data from JSON file
    with open(input_file, 'r', encoding='utf-8') as f:
        data = [json.loads(line) for line in f]


    unique_books = set()
    unique_data = []
    for record in data:
        if "Erscheinungsdatum" in record:
            try:
                date_str = record["Erscheinungsdatum"]
                for german_month, english_month in german_to_english_months.items():
                    date_str = date_str.replace(german_month, english_month)
                parsed_date = datetime.strptime(date_str, "%d. %B %Y")
                record["Erscheinungsdatum"] = parsed_date.strftime("%d.%m.%Y")
            except ValueError:
                pass


        book_key = (record.get("Titel"), tuple(record.get("Autor", [])))
        if book_key not in unique_books:
            unique_books.add(book_key)
            unique_data.append(record)


    with open(output_file, 'w', encoding='utf-8') as f:
        for record in unique_data:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

if __name__ == "__main__":
    input_file = '/Users/rassulraketa/PycharmProjects/ScrapWeb1.0/DE_Book_Scarpper/Rassul_Chsheriyazdanov_Scrapers/Data/all_books.json'
    output_file = '/Users/rassulraketa/PycharmProjects/ScrapWeb1.0/DE_Book_Scarpper/Rassul_Chsheriyazdanov_Scrapers/Data/all_books_normalized1.json'

    normalize_date(input_file, output_file)
    print("Date normalization and duplicate removal completed.")

