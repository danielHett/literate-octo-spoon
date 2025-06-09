import { encode, decode } from "./src/index";
import { readFileSync } from 'node:fs';
import * as path from 'path';

interface result {
    originalSize: number,
    compressedSize: number,
    equalContents: boolean
}

/**
 * Von StackOverflow geklaut. 
 */
const areUnit8ArraysEqual = (a: Uint8Array, b: Uint8Array) => {
    
    
    if (a.length !== b.length) {
        console.log(a.length, b.length);
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

/**
 * A helper for running a test on a file. Given a file name, returns the original size, the compressed size, and whether the
 * contents were equal.  
 */
const doTest = (p: string): result => {
    // Load the file and get its size. 
    let uncompressedFile: Uint8Array = readFileSync(p);
    let originalSize: number = uncompressedFile.length;

    // Then compress. 
    let compressedFile: Uint8Array = encode(uncompressedFile);
    let compressedSize: number = compressedFile.length;

    // Now compare. 
    let deflatedFile: Uint8Array = decode(compressedFile);

    return { originalSize, compressedSize, equalContents: areUnit8ArraysEqual(uncompressedFile, deflatedFile) };
}


test('Does it work with the bee movie script?', () => {
    let res = doTest(path.join(__dirname, 'test_files', 'bee_movie_script.txt'));

    console.log(`Original size: ${res.originalSize}\nCompressed size: ${res.compressedSize}\nWere they equal? ${res.equalContents ? 'Yes' : 'No'}`);

    expect(res.equalContents).toBe(true);
});

test('Does it work with novel "war and peace"?', () => {
    let res = doTest(path.join(__dirname, 'test_files', 'war_and_peace.txt'));

    console.log(`Original size: ${res.originalSize}\nCompressed size: ${res.compressedSize}\nWere they equal? ${res.equalContents ? 'Yes' : 'No'}`);

    expect(res.equalContents).toBe(true);
});

test('Does it work with a song?', () => {
    let res = doTest(path.join(__dirname, 'test_files', 'pashanim_kleiner_prinz.mp3'));

    console.log(`Original size: ${res.originalSize}\nCompressed size: ${res.compressedSize}\nWere they equal? ${res.equalContents ? 'Yes' : 'No'}`);

    expect(res.equalContents).toBe(true);
});