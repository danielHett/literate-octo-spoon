import { MinPriorityQueue } from '@datastructures-js/priority-queue';
export const isLeaf = (node) => {
    return node.left === null && node.right === null;
};
/**
 * Given a map (byte to number of occurences), build a huffman encoding tree.
 *
 * @param counts is the map of byte to number of occurences.
 * @returns the root node of the tree.
 */
export const buildTreeFromCounts = (counts) => {
    // Create and populate the queue. 
    let nodes = new MinPriorityQueue((n) => n.count);
    for (let [byte, count] of counts.entries()) {
        nodes.enqueue({ byte, count, left: null, right: null });
    }
    // Now process until only one element left. That element is the root. 
    while (nodes.size() > 1) {
        // We know there are at least two nodes left, so this is safe. 
        let a = nodes.dequeue();
        let b = nodes.dequeue();
        // Create the new node. 
        let c = { byte: null, count: a.count + b.count, left: a, right: b };
        // Put it back. 
        nodes.enqueue(c);
    }
    // Now we know there is only one element. We pop it and that is the tree. 
    return nodes.dequeue();
};
export const buildTreeFromPaths = (encodingDict) => {
    // Recursive helper for building the tree. 
    const attachNode = (curr, byte, path) => {
        if (path.length === 0)
            throw new Error('Something went terribly wrong.');
        if (path.length === 1) {
            let leaf = { byte, left: null, right: null };
            path[0] ? curr.right = leaf : curr.left = leaf;
            return;
        }
        // Not done. Need to keep moving down the tree. If a node doesn't exist yet for the
        // path that we want to take, then we need to create it. 
        let nextDir = path.shift();
        let next = nextDir ? curr.right : curr.left;
        if (!next) {
            next = { byte: null, left: null, right: null };
            nextDir ? curr.right = next : curr.left = next;
        }
        attachNode(next, byte, path);
    };
    const root = { byte: null, left: null, right: null };
    for (let [byte, path] of encodingDict.entries()) {
        attachNode(root, byte, [...path]);
    }
    return root;
};
/**
 * A recusive function for building a dictionary from a huffman encoding tree.
 *
 * @param node is the current node in the tree.
 * @param history is an array that has the recorded path.
 * @returns a map from byte to encoding.
 */
export const buildEncodingDict = (node, history = []) => {
    // If we are at a leaf, we can add it to the encoding dictionary. 
    if (isLeaf(node))
        return new Map([[node.byte, history]]);
    // Otherwise, we keep traversing. 
    let left = node.left ? buildEncodingDict(node.left, [...history, 0]) : new Map();
    let right = node.right ? buildEncodingDict(node.right, [...history, 1]) : new Map();
    return new Map([...left, ...right]);
};
//# sourceMappingURL=utils.js.map