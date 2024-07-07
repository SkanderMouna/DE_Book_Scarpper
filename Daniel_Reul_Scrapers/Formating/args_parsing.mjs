function isOption(str) { return /^\s*-(-)?/.test(str) }

function castNumber(anything, err_msg) {
    let parsed = Number(anything);
    if (isNaN(parsed)) { throw Error(`${err_msg}: ${anything} is NaN`); }
    return parsed;
}
let option_index_map={};
function mirrorF(args_parsed,key,_key){
    args_parsed[_key]=args_parsed[key];
    
}
/**
 *
 * @param {any} required 
 * @returns {[]}
 */
export function ArgsParse(required={}, { name_args_in_count, n ,mirror=true,m} = { name_args_in_count: false }) {
    if(m!==undefined)mirror=m;
    if(n!==undefined)name_args_in_count=n;
    option_index_map={}
    let args = process.argv.slice(2);
    let prev_option;
    let cur = 0;
    let args_parsed = [];
    args.forEach((x, i) => {
        if (!prev_option) {
            if (isOption(x)) { prev_option = x; args_parsed[prev_option] =true;if(mirror)args_parsed[prev_option.replace(/^\s*-(-)?/, "")] = true;}
            else { args_parsed[cur++] = x; }
        }
        else {
            if (isOption(x)) {
                console.warn(`\x1b[91;1m\tArgsparse Warning: '${x}' is interpreted as option for '${prev_option}'\x1b[m`);
            }
            args_parsed[prev_option] = x;
            if(mirror)args_parsed[prev_option.replace(/^\s*-(-)?/, "")] = x;
            if (name_args_in_count ) { 
                option_index_map[prev_option]=cur;
                ;args_parsed[cur++] = x; }
            prev_option = undefined;
        }

    });
    if (prev_option !== undefined) { console.warn(`Unconsumed option ${prev_option}`) }
    for (let [key, val] of Object.entries(required)) {
        let _key=key;
        if (!key.startsWith('-'))_key = '-' + key;
        else{_key=key.replace(/^\s*-(-)?/, "")}
        if (!args_parsed[key]) {
            throw Error(`requried arg ${key} is missing`);
        }
        let cast_v;
        if (typeof val === 'number') {
            cast_v= castNumber(args_parsed[key], `\t at requried arg ${key}`);
            if(mirror){mirror(args_parsed,key,_key)}
        }
        if (val.constructor.name === 'Array') {
            cast_v= args_parsed[key].split((val?.[1]) ?? ',');
            if (typeof val[0] === 'number') {
                for (let i = 0; i < cast_v.length; i++) {
                    cast_v[i] = castNumber(cast_v[i], `\t at requried arg ${key}[${i}]`);
                }
            }
        }
        args_parsed[key] = cast_v;
        if(mirror){mirrorF(args_parsed,key,_key)}
        if(name_args_in_count){if(option_index_map[key]){args_parsed[option_index_map[key]]=args_parsed[key];}}

    }
    return args_parsed;
}