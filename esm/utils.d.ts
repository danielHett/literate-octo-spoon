/**
 * If a node has no byte value *and* no children, then we are at the terminating character.
 */
export interface node {
    byte: number | null;
    count?: number;
    left: node | null;
    right: node | null;
}
export declare const isLeaf: (node: node) => boolean;
/**
 * Given a map (byte to number of occurences), build a huffman encoding tree.
 *
 * @param counts is the map of byte to number of occurences.
 * @returns the root node of the tree.
 */
export declare const buildTreeFromCounts: (counts: Map<number | null, number>) => node;
export declare const buildTreeFromPaths: (encodingDict: Map<number | null, Array<number>>) => node;
/**
 * A recusive function for building a dictionary from a huffman encoding tree.
 *
 * @param node is the current node in the tree.
 * @param history is an array that has the recorded path.
 * @returns a map from byte to encoding.
 */
export declare const buildEncodingDict: (node: node, history?: Array<number>) => Map<number | null, Array<number>>;
