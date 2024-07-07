import { readFile, writeFile } from 'fs';

import { ArgsParse } from "./args_parsing.mjs";

/**
 * Written by Daniel
 *Converts a JSON array file  ( [{...},{...},...]  ) to a jsonl file   ( {...}\n{...}\n{...}  )  
 * node toJsonl.mjs --inputFilePath "in path"  --outputFilePath "out path"
 *
 */

// Function to read JSON array from a file
const readJsonArrayFromFile = (inputFilePath) => {
    return new Promise((resolve, reject) => {
        readFile(inputFilePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const jsonArray = JSON.parse(data);
                if (!Array.isArray(jsonArray)) {
                    throw new Error('Input file does not contain a JSON array.');
                }
                resolve(jsonArray);
            } catch (parseError) {
                reject(parseError);
            }
        });
    });
};

// Function to write JSONL to a file
const writeJsonlToFile = (outputFilePath, jsonArray) => {
    return new Promise((resolve, reject) => {
        const jsonlData = jsonArray.map(obj => JSON.stringify(obj)).join('\n');
        writeFile(outputFilePath, jsonlData, 'utf8', (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

// Main function to transform JSON array to JSONL
const transformJsonToJsonl = async (inputFilePath, outputFilePath) => {
    try {
        const jsonArray = await readJsonArrayFromFile(inputFilePath);
        await writeJsonlToFile(outputFilePath, jsonArray);
        console.log('Transformation successful. Output written to:', outputFilePath);
    } catch (error) {
        console.error('Error during transformation:', error);
    }
};


let args = ArgsParse();


// Example usage
const inputFilePath = args.in_file ?? "normed.json";
const outputFilePath = args.out_file ?? 'output.jsonl';

transformJsonToJsonl(inputFilePath, outputFilePath);