import fs from 'node:fs';

export function loadJSONL(file) {

    let text = fs.readFileSync(file, 'utf8');
    text = text.split('\r\n');
    let jsonl_arr = text.map(json => { try { return JSON.parse(json) } catch (e) { } }).filter(x => x);
    return jsonl_arr;
}

export function loadArrayJSONL(filenames = [],abortOnError) {
    let ar_jsonls = [];

    for (const filename of filenames) {
        try {
            let json_l = loadJSONL(filename);
            ar_jsonls.push(json_l);
        }
        catch (err) {
            console.error(`While tying to load ${filename}\n`, err);
            if(abortOnError){throw new Error("File Error")}
        }
    }
    return ar_jsonls;
}

export function clamp(str,max){
    if(str.length>max){
        console.log("ibiggs")
        return str.slice(0,max/2-1)+"..."+(str.slice( Math.min( -(max/2)+2,-1)));
    }
    return str;
}