import { ArgsParse } from "./args_parsing.mjs";
import { clamp, loadArrayJSONL } from "./helper.mjs";
import fs from 'node:fs'
import os from "node:os";
import { valid_probs } from "./valid_probs.mjs";
/**
 * writen by Daniel 
 * this script can normalise my dataset to the agreed format
 * it can take multible resultfiles from my scraper like
 *      node normalise.mjs  ..\Data\feste-partys-9422.jsonl ..\Data\anime-4754.jsonl ..\ArticleData\page1.jsonl --out_file normed_auth_relaes.jsonl  [ -TS 30    --restrict_probs true]
 *                                                                                                              |                                     |            ^~~(or -r )  only use probs that are in valid props    
 *                                                                                                              ^~~~(or -o)  in which file to write   ^~~~use only 30 chars of Title 
 * 
 * it also makes some mapping
 * and deduplicate the data
 * -the TitleSlice  is good to filter out movies that appeare as DVDS and Blurays for my Data Set can be disabled
 * -
 */


let args = ArgsParse();

let file_names = [...args];
console.log(`\nparsed args are %o`, args);
let out_file =args.o?? args.out_file ?? "normed.jsonl";
let  do_title_sl= args.TS ??args.title_slice ?? undefined;
let restrict_probs =args.r?? args.restrict_probs ?? false;
let isbnNoHypen=args.ISBNnH??args.isbn_no_hyphon??false;

let all_jsonls = loadArrayJSONL(file_names, true)
let i = 0;

for (const jsonl of all_jsonls) {
    let keys = Object.keys(jsonl[0]);
    let asStr = JSON.stringify(jsonl);
    console.log(`\t${file_names[i++]}:  ${jsonl.length} \n\t\tKeys first: ${keys.length}:${clamp(keys.reduce((a, c) => a + " " + c), 300)}\n\t\tData\n\t\t${clamp(asStr, 100)}`);
}

function getUniqueOnProb(collection, key) {
    let all_val = new Map();
    for (const book of collection) {
        let val = book?.[key];
        if (val?.length === 0) continue;
        let num = all_val.get(val);
        if (num === undefined) { all_val.set(val, 1) }
        else { all_val.set(val, num + 1) }

    }
    return all_val;
}
function Count(arr) {
    const counts = {};
    for (const num of arr) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    return counts;
}

function allDifferentKeys(collection) {
    let all_keys = new Map();
    for (const book of collection) {
        for (const key of Object.keys(book)) {
            if (key.length === 0) continue;
            let num = all_keys.get(key);
            if (num === undefined) { all_keys.set(key, 1) }
            else { all_keys.set(key, num + 1) }
        }
    }
    return all_keys;
}

const allowed_categories = ['Sachbücher', 'Handwerk', 'Schule', 'Fachbücher', 'Krimi&Thriller',
    'Kochen&Backen', 'Fantasy', 'Ratgeber', 'Länder&Städte', 'Romanze', 'Drama', 'Erotik',
    'Manga', 'Comic', 'Kinderbücher', 'Abenteuer', 'Jugendbücher',
    'Reisen', 'Sprachen&Lernen', 'Dokumentationen',
    'Horror', 'TV-Serien', 'NewAdult', 'Entspannung', 'Action', 'Self-Publishing',
    'Komödie', 'Klassiker', 'Biografien', 'Familie', 'Animation', 'ScienceFiction', 'Comedy&Humor',
    'Jugendhörbücher', 'BookTok', 'Eastern', 'Western', 'Anime', 'Literaturverfilmungen', 'Märchen', 'Romane', 'Hobby',]

function determinKategory(book) {


    let cat_parts = book.Kategorien.split(/\/|,|&/);

    //for movies Genre is more accurate
    if(book.Genre){
        cat_parts=book.Genre.split(/\/|,|&/);
    }
    book.rawKategorien = book.Kategorien;
    book.Kategorien = [];
    let Kategorien_set = new Set();
    for (const cat_part of cat_parts) {
        for (const cat of allowed_categories) {
            if (cat.includes(cat_part)) {
                Kategorien_set.add(cat);
                break
            }
        }
    }
    book.Kategorien = [...Kategorien_set];

}
function determinProductTyp(book) {
    let key = "Produktart"
    if (/Taschenbuch/i.test(book.Einband)) { return book[key] = "Taschenbuch" }
    if (/Gebund/i.test(book.Einband)) { return book[key] = "Gebundenes Buch" }
    let typ = book.ExtraInfo;

    //use 'Medium' for Films 
    if (typ == undefined || typ === "") { 
        typ = book.Medium;
        // book[key] = ""; return 
    }
    if (/Taschenbuch/i.test(typ)) { return book[key] = "Taschenbuch" }
    if (/Gebunde/i.test(typ)) { return book[key] = "Gebundenes Buch" }
    if (/Hörbuch/i.test(typ)) { return book[key] = "Hörbuch" }
    if (/Buch/i.test(typ)) {
        { return book[key] = "Buch" }
    }
    if (/eBook/i.test(typ) || /eBook/i.test(book.Kategorien)) { return book[key] = "eBook" }
    if (/DVD/i.test(typ)) { return book[key] = "DVD" }
    if (/Blu(-)?(r|R)ay/i.test(typ)) { return book[key] = "Blu-ray" }
    if (/Film/i.test(typ)) {
        return book[key] = "Film";
    }
    book[key] = ""; return
}
function filmAutorReplacement(book) {
    if (book.Autor.length === 0 && book.Regisseur) {
        book.Autor = [book.Regisseur];
    }
}

function filterOnlyValidProps(book) {
    let filtered = {};
    for (const prob of valid_probs) {
        filtered[prob] = book[prob];
    }
    return filtered;
}

let all = all_jsonls.flatMap(x => x);
console.log(all.length);

let normalised = [];

let map_uniqe = new Map();
for (const book of all) {
    if (book.Titel === "") continue;
    const { Autor, Titel, Erscheinungsdatum } = book;
    
    let tilte_sl=do_title_sl? Titel.slice(0,do_title_sl ):Titel;
    let autor_title_release = tilte_sl + Autor.join() ;
    let uniq_tag = map_uniqe.get(autor_title_release);
    if (uniq_tag == undefined) {
        determinProductTyp(book);
        if(isbnNoHypen&&book.ISBN) {book.ISBN=book.ISBN.replaceAll('-',"");}
        determinKategory(book);
        filmAutorReplacement(book);
        let filteredbook = restrict_probs ? filterOnlyValidProps(book) : book;
        normalised.push(filteredbook);
        map_uniqe.set(autor_title_release, 1);
    }
    else {
        map_uniqe.set(autor_title_release, uniq_tag + 1);
    }
}


console.log("normalised length", normalised.length);

let log_dups = [...map_uniqe].filter(([key, val]) => val > 1).map(x => (x[1] + "")?.padEnd(5) + ":" + x[0]).join(os.EOL)
try {
    fs.writeFileSync(out_file, normalised.map(x => JSON.stringify(x)).join(os.EOL));
    fs.writeFileSync(out_file + ".duplication.txt", "Duplication\n" + log_dups);
} catch (err) {
    console.error(err);
}