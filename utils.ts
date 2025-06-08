import { MinPriorityQueue } from '@datastructures-js/priority-queue';

/**
 * If a node has no byte value *and* no children, then we are at the terminating character. 
 */
export interface node {
    byte: number | null,
    count?: number,
    left: node | null,
    right: node | null
}

export const isLeaf = (node: node): boolean => {
    return node.left === null && node.right === null;
}

/**
 * Given a map (byte to number of occurences), build a huffman encoding tree. 
 * 
 * @param counts is the map of byte to number of occurences. 
 * @returns the root node of the tree. 
 */
export const buildTreeFromCounts = (counts: Map<number | null, number>): node => {
    // Create and populate the queue. 
    let nodes: MinPriorityQueue<node> = new MinPriorityQueue<node>((n: node) => n.count!);
    for (let [byte, count] of counts.entries()) {
        nodes.enqueue({ byte, count, left: null, right: null });
    }

    // Now process until only one element left. That element is the root. 
    while (nodes.size() > 1) {
        // We know there are at least two nodes left, so this is safe. 
        let a: node = nodes.dequeue()!;
        let b: node = nodes.dequeue()!;

        // Create the new node. 
        let c: node = { byte: null, count: a.count! + b.count!, left: a, right: b };

        // Put it back. 
        nodes.enqueue(c);
    }

    // Now we know there is only one element. We pop it and that is the tree. 
    return nodes.dequeue()!;
}

export const buildTreeFromPaths = (encodingDict: Map<number | null, Array<number>>): node => {
    // Recursive helper for building the tree. 
    const attachNode = (curr: node, byte: number | null, path: Array<number>): void => {
        if (path.length === 0) throw new Error('Something went terribly wrong.');
        if (path.length === 1) {
            let leaf: node = { byte, left: null, right: null };
            path[0] ? curr.right = leaf : curr.left = leaf;
            return;
        }

        // Not done. Need to keep moving down the tree. If a node doesn't exist yet for the
        // path that we want to take, then we need to create it. 
        let nextDir: number | undefined = path.shift();
        let next: node | null = nextDir ? curr.right : curr.left;

        if (!next) {
            next = { byte: null, left: null, right: null };
            nextDir ? curr.right = next : curr.left = next;
        }

        attachNode(next, byte, path);
    }   

    const root: node = { byte: null, left: null, right: null };
    for (let [byte, path] of encodingDict.entries()) {
        attachNode(root, byte, [...path]);
    }

    return root;
}

/**
 * A recusive function for building a dictionary from a huffman encoding tree. 
 * 
 * @param node is the current node in the tree. 
 * @param history is an array that has the recorded path.  
 * @returns a map from byte to encoding. 
 */
export const buildEncodingDict = (node: node, history: Array<number> = []): Map<number | null, Array<number>> => {
    // If we are at a leaf, we can add it to the encoding dictionary. 
    if (isLeaf(node)) 
        return new Map<number | null, Array<number>>([[node.byte, history]]);
    
    // Otherwise, we keep traversing. 
    let left = node.left ? buildEncodingDict(node.left!, [...history, 0]) : new Map<number, Array<number>>();
    let right = node.right ? buildEncodingDict(node.right!, [...history, 1]) : new Map<number, Array<number>>();

    return new Map<number | null, Array<number>>([...left, ...right]);
}