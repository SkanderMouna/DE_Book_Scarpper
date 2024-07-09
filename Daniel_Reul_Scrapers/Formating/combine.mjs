import { ArgsParse } from "./args_parsing.mjs";
import { clamp, loadArrayJSONL } from "./helper.mjs";
import fs from 'node:fs'
import os from 'node:os';
import { valid_probs } from "./valid_probs.mjs";
/**
 * writen by Daniel 
 * this script can combine multiple jsonl together
 * i
 *      node combine.mjs    danielBooks.jsonl  ..\..\Rassul_Chsheriyazdanov_Scrapers\Data\all_books_normalized1.json "mouna.jsonl"     -o combined_D_R_M.jsonl
 * 
 * it also deduplicate the data
 * 
 * 
 * to put it in Combined: node combine.mjs    danielBooks.jsonl  ..\..\Rassul_Chsheriyazdanov_Scrapers\Data\all_books_normalized1.json "mouna_final.jsonl"     -o ..\..\CombinedDataSet\All\combined_D_R_M.jsonl
 */


let args = ArgsParse();

let file_names = [...args];
console.log(`\nparsed args are %o`, args);
let out_file =args.o ?? args.out_file ?? "normed.jsonl";
let  do_title_sl= args.TS ??args.title_slice ?? undefined;
let restrict_probs =args.r?? args.restrict_probs ?? false;

let all_jsonls = loadArrayJSONL(file_names, true)
let i = 0;



for (const jsonl of all_jsonls) {
    // console.log(jsonl[3]);
    if(!jsonl[0])continue;
    
    let keys = Object.keys(jsonl[0]);
    let asStr = JSON.stringify(jsonl);
    console.log(`\t${file_names[i++]}:  ${jsonl.length} \n\t\tKeys first: ${keys.length}:${clamp(keys.reduce((a, c) => a + " " + c), 300)}\n\t\tData\n\t\t${clamp(asStr, 100)}`);
}


function filterOnlyValidProps(book) {
    let filtered = {};
    for (const prob of valid_probs) {
        filtered[prob] = book[prob];
    }
    return filtered;
}

let all = all_jsonls.flatMap(x => x); 

let normalised = [];

let map_uniqe = new Map();
for (const book of all) {
    if (book.Titel === "") continue;
    //Some of mounas book are array this line is to skip them
    if(book.constructor.name=='Array')continue
    if(typeof book.Autor ==='string'){book.Autor=[book.Autor]}
    if(typeof book.Kategorien ==='string'){book.Kategorien=[book.Kategorien]}

    const { Autor, Titel, Erscheinungsdatum } = book;
    
    //Some of mounas Autors are no Array
    let title_sl=do_title_sl? Titel.slice(0, do_title_sl):Titel
    let autor_title_release = title_sl + Autor.join() ;
    let uniq_tag = map_uniqe.get(autor_title_release);
    if (uniq_tag == undefined) {
        if(restrict_probs){
            let filtered=filterOnlyValidProps(book);
            if(Object.keys(filtered).length>0) normalised.push(filtered);
        }
        else{
            normalised.push(book);
        }
        map_uniqe.set(autor_title_release, 1);
    }
    else {
        map_uniqe.set(autor_title_release, uniq_tag + 1);
    }
}


console.log("combined length", normalised.length);

let log_dups = [...map_uniqe].filter(([key, val]) => val > 1).map(x => (x[1] + "")?.padEnd(5) + ":" + x[0]).join(os.EOL)
try {
    fs.writeFileSync(out_file, normalised.map(x => JSON.stringify(x)).join(os.EOL));
    fs.writeFileSync(out_file + ".duplication.txt", "Duplication\n" + log_dups);
} catch (err) {
    console.error(err);
}