import { ArgsParse } from "./args_parsing.mjs";
import {  loadArrayJSONL, loadJSONL } from "./helper.mjs";
import fs from 'node:fs'
import os from 'node:os';
/**
 * writen by Daniel 
 * This console script gets a jsonl file and a number how many Object you want per file
 * and the writes split Data to disk
 * it can filter book that aren't released yet
 * node split.mjs  ..\..\CombinedDataSet\All\combined_D_R_M.jsonl -N 500   -o ..\..\CombinedDataSet\ByRelease\combined_D_R_M.jsonl
 */


let args = ArgsParse({N:100});

console.log(`\nparsed args are %o`, args);
let in_file =args.i ?? args.in_file ??args[0] ??undefined;
let out_file_name= args.o?? args.out_file_name??in_file.split('.jsonl')[0];
let until_now=args.u??args.until_now??true;
if(!in_file)process.exit(1);
let split_num =args.N?? args.num ?? 100;

let books = loadJSONL(in_file);

function parseDMY (s) {
    let [d, m, y] = s.split(/\.| /);
    return new Date(y, m-1, d);
  };

  let now=new Date();
let filter_have_year=[];
for(const book of books){
    const {Erscheinungsdatum}=book;
    if(!Erscheinungsdatum)continue;
    let date=parseDMY(Erscheinungsdatum);
    if(date.toString()==='Invalid Date'){
        let year=Erscheinungsdatum.split(/\.| /).at(-1);
        year = Number(year);
        if(isNaN(year))continue;
        date=new Date(year,0,1);
    }
    book.date=date;
    if(until_now&&date>now)continue;
    filter_have_year.push(book);
}

filter_have_year.sort((a,b)=>a.date-b.date)

for(const book of filter_have_year){
    book.date=book.date.toLocaleDateString();
}

const years=filter_have_year.map(x=>x.date);

console.log("All books",books.length,"With year",filter_have_year.length,years.slice(0,100),years.slice(-100));

for(let i=0;i<filter_have_year.length;i+=split_num){
    const this_slice=filter_have_year.slice(i,i+split_num);
    try {
        
        fs.writeFileSync(out_file_name+"_"+i+".jsonl", this_slice.map(x => JSON.stringify(x)).join(os.EOL));
    } catch (err) {
        console.error(err);
        break;
    }
}