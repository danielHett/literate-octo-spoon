# literate-octo-spoon

## Overview

This project is a TypeScript implementation of Huffman encoding. To understand how the code works, I've included a reading as a PDF titled `huffman-encoding.pdf`. It gives a more detailed overview and examples. The code roughly follows the reading.

## Usage

The module only has two functions.

### `encode(Uint8Array): Uint8Array`

Given a byte array, returns another, compressed byte array.

### `decode(Uint8Array): Uint8Array`

Given a byte array that has been compressed by `encode`, returns another, decompressed byte array.

## Testing

To run tests, first install the necessary modules with `npm install`. Then run `npm run test`.
