import { node, buildTreeFromCounts, buildTreeFromPaths, buildEncodingDict, isLeaf } from "./utils";

let END_CHAR = '\0';

export const encode = (bytes: Uint8Array): Uint8Array => {
    // Get the count for each byte.
    let counts: Map<number | null, number> = new Map();
    for (let byte of bytes) {
        if (counts.has(byte)) counts.set(byte, counts.get(byte)! + 1);
        else counts.set(byte, 1);
    } 

    // Don't forget to set the null byte. 
    counts.set(null, 1);

    let root: node = buildTreeFromCounts(counts);

    // Now we need a dictionary. 
    let encodingDict: Map<number | null, Array<number>> = buildEncodingDict(root);

    // We need to know how many bytes are needed to encode all characters. 
    // We add extra bits for the null character. 
    const numBits: number = bytes.reduce((acc, byte) => acc + encodingDict.get(byte)!.length, 0) + encodingDict.get(null)!.length;
    const encodedMessage: Uint8Array = new Uint8Array(Math.ceil(numBits / 8));

    // i tracks the current bit, j tracks the current byte. 
    let i: number = 7, j: number = 0;
    for (let byte of bytes) {
        // Get all bits in the encoding. 
        let bits: Array<number> = encodingDict.get(byte)!;
        for (let bit of bits) {
            // Do some work. 
            encodedMessage[j] |= (bit << i);

            // Update the bit/byte counter. 
            i -= 1;
            if (i < 0) {
                i = 7;
                j += 1;
            }
        }
    }

    // Don't forget to add the termination. Yes, I know it's repeated code. 
    for (let bit of encodingDict.get(null)!) {
        encodedMessage[j] |= (bit << i);
        i -= 1;
        if (i < 0) {
            i = 7;
            j += 1;
        }
    }

    // Let's also create the stringified version of the encoding dictionary. 
    const stringifiedEncodingDict: Uint8Array = new Uint8Array([...encodingDict].reduce((acc, [_, bits]) => acc + bits.length + 3, 0) + 3);

    i = 0;
    for (let [byte, pattern] of encodingDict.entries()) {
        // Skip if null. 
        if (byte === null) continue;
        
        // Add the byte.
        stringifiedEncodingDict[i++] = byte;
        
        // Add the encoding. 
        pattern.forEach((n) => {
            stringifiedEncodingDict[i++] = n
        });

        // Pad the end. 
        stringifiedEncodingDict[i++] = 121;
        stringifiedEncodingDict[i++] = 121;
    }

    // This signifies the start of the termination character. 
    stringifiedEncodingDict[i++] = 122;
    stringifiedEncodingDict[i++] = 122;

    // Add the encoding. 
    encodingDict.get(null)!.forEach((n) => {
        stringifiedEncodingDict[i++] = n
    });

    // Pad the end. 
    stringifiedEncodingDict[i++] = 121;
    stringifiedEncodingDict[i++] = 121;

    // Add two xs. This signifies the end of the encoding dictionary. 
    stringifiedEncodingDict[i++] = 120;
    stringifiedEncodingDict[i++] = 120;

    // Merge and done. 
    let finalEncoding: Uint8Array = new Uint8Array([...stringifiedEncodingDict, ...encodedMessage]);

    return finalEncoding;
}

export const decode = (fileBuffer: Uint8Array): Uint8Array => {
    // First we need to read the encoding dictionary. 
    let encodingDict: Map<number | null, Array<number>> = new Map<number, Array<number>>();
    let start = 0;
    let byte: number | null | undefined;
    let path: Array<number> = [];
    for (let i = 0; i < fileBuffer.length; i++) {
        // See if we've reached the end. 
        let charsLeft = fileBuffer.length - i - 1;
        if (charsLeft === 0) break;
        
        if (fileBuffer[i] === 120 && fileBuffer[i + 1] === 120) {
            start = i + 2;
            break;
        }

        if (fileBuffer[i] === 122 && fileBuffer[i + 1] === 122) {
            byte = null;
            i++;
            continue;
        }

        // Otherwise we are reading a dictionary entry. 
        // Two y characters reset. 
        if (fileBuffer[i] === 121 && fileBuffer[i + 1] === 121) {
            // We shouldn't see byte null here. 
            if (byte === undefined) throw new Error('Something went terribly wrong.');
            
            // Add to the dictionary. 
            encodingDict.set(byte, path)
            
            // Now reset!
            byte = undefined;
            path = [];

            // Give one more to i. We continue on our way. 
            i++;
            continue;
        }

        // If byte is null, then read the character into the byte variable. Otherwise, it is a part of the path. 
        if (byte === undefined) byte = fileBuffer[i]
        else path.push(fileBuffer[i]);
    }

    // We never saw the end. Throw an error here. 
    if (start === 0) throw new Error('Something went terribly wrong.');

    // Finally we decode. 
    let bytes: Array<number> = [];
    let root: node = buildTreeFromPaths(encodingDict);

    let curr: node = root;
    for (let i = start; i <= fileBuffer.length - 1; i++) {
        for (let j = 7; j >= 0; j--) {            
            // Read a bit. 
            let bit: number = (fileBuffer[i] >> j) & 1

            // Update our position in the tree. If the bit is '1' we go right, otherwise left.  
            curr = bit ? curr.right! : curr.left!;
            
            // The variable 'curr' should still be defined. This is just a sanity check. 
            if (curr === null) throw new Error('Something went terribly wrong.');

            // If there is a byte, we have a leaf. 
            if (isLeaf(curr)) {                
                // If we've encountered the null character, then we are done. 
                if (curr.byte === null) return new Uint8Array(bytes); 
                
                // Otherwise, push and continue. 
                bytes.push(curr.byte);
                curr = root;
            } 
        }
    }

    throw new Error('Something went terribly wrong.'); 
}


