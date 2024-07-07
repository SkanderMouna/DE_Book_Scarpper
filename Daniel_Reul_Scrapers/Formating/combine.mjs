import { ArgsParse } from "./args_parsing.mjs";
import { clamp, loadArrayJSONL } from "./helper.mjs";
import fs from 'node:fs'
import os from 'node:os';
/**
 * writen by Daniel 
 * this script can combine multiple jsonl together
 * i
 *      node combine.mjs  ..\Data\feste-partys-9422.jsonl ..\Data\anime-4754.jsonl ..\ArticleData\page1.jsonl --out_file combined.jsonl
 * 
 * it also makes some mapping
 * and deduplicate the data
 */


let args = ArgsParse();

let file_names = [...args];
console.log(`\nparsed args are %o`, args);
let out_file = args.out_file ?? "normed.jsonl";
let sliceTitel= args.title_slice?? undefined;


let all_jsonls = loadArrayJSONL(file_names, true)
let i = 0;



for (const jsonl of all_jsonls) {
    // console.log(jsonl[3]);
    if(!jsonl[0])continue;
    
    let keys = Object.keys(jsonl[0]);
    let asStr = JSON.stringify(jsonl);
    console.log(`\t${file_names[i++]}:  ${jsonl.length} \n\t\tKeys first: ${keys.length}:${clamp(keys.reduce((a, c) => a + " " + c), 300)}\n\t\tData\n\t\t${clamp(asStr, 100)}`);
}

i=0
console.log(all_jsonls.length);
for(const jsonl of all_jsonls){
    console.log(file_names[i],jsonl.length);
    i++;
}



let all = all_jsonls.flatMap(x => x); 

let normalised = [];

let map_uniqe = new Map();
for (const book of all) {
    if (book.Titel === "") continue;
    const { Autor, Titel, Erscheinungsdatum } = book;
    let title_sl=sliceTitel? Titel.slice(0, sliceTitel):Titel
    let autor_title_release = title_sl + Autor.join() ;
    let uniq_tag = map_uniqe.get(autor_title_release);
    if (uniq_tag == undefined) {
        normalised.push(book);
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