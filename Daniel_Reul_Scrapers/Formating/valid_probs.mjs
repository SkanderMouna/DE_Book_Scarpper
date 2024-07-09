export const valid_probs = Object.keys(
    {
        "Titel": "book title",
        "Autor": ["ich bin den Author", "Author 2"], //as an array
        "ISBN": "",
        "Produktart": "Taschenbuch" || "Gebunden",
        "Erscheinungsdatum": "05.05.2022",
        "Kategorien": ["fantasy"],
        "Img": ["cover image url", "second image url"],
        "Beschreibung": "long description of the book",
        "Verlag": "the publisher",
        "Auflage": "the version of the book",
    }
);