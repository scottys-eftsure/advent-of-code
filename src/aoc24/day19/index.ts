import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): Onsen {
    const [towelSection, designSection] = data.split('\n\n');
    
    const towels = towelSection.split(', ')
        .filter(line => line.trim() !== '')
        .map(line => new Towel(line));

    const designs = designSection.split('\n')
        .filter(line => line.trim() !== '')
        .map(line => new Design(line));

    return new Onsen(towels, designs);
}

class Towel {
    pattern: string

    constructor(pattern: string) {
        this.pattern = pattern
    }
}

class Design {
    sequence: string

    constructor(sequence: string) {
        this.sequence = sequence
    }
}

class TrieNode {
    children: Map<string, TrieNode>;
    towels: { towel: Towel, length: number }[];
    
    constructor() {
        this.children = new Map();
        this.towels = [];
    }
}

class Onsen {
    towels: Towel[];
    designs: Design[];
    patternTrie: TrieNode;
    memoizedResults: Map<string, number>;

    constructor(towels: Towel[], designs: Design[]) {
        this.towels = towels;
        this.designs = designs;
        this.patternTrie = new TrieNode();
        this.memoizedResults = new Map();
        
        // Build the trie
        for (let towel of towels) {
            let node = this.patternTrie;
            const pattern = towel.pattern;
            
            for (let char of pattern) {
                if (!node.children.has(char)) {
                    node.children.set(char, new TrieNode());
                }
                node = node.children.get(char)!;
            }
            // Store the length with the towel to avoid pattern.length calls
            node.towels.push({ towel, length: pattern.length });
        }
    }

    toString() {
        return `Onsen(towels: ${this.towels.length}, designs: ${this.designs.length})`
    }

    findValidTowels(design: Design): { towel: Towel, remainingLength: number }[] {
        let results: { towel: Towel, remainingLength: number }[] = [];
        let node = this.patternTrie;
        
        for (let i = 0; i < design.sequence.length; i++) {
            const char = design.sequence[i];
            
            if (!node.children.has(char)) {
                break;
            }
            
            node = node.children.get(char)!;
            
            // Use pre-calculated lengths instead of slicing
            for (let { towel, length } of node.towels) {
                results.push({
                    towel,
                    remainingLength: design.sequence.length - length
                });
            }
        }
        
        return results;
    }

    fitTowelsToDesign(design: Design): Towel[] | undefined {
        let towels: Towel[] = [];


        let validTowels = this.findValidTowels(design);

        for (let validTowel of validTowels) {
            if (validTowel.remainingLength === 0) {
                return [validTowel.towel]
            }

            let result = this.fitTowelsToDesign(new Design(design.sequence.slice(design.sequence.length - validTowel.remainingLength)))

            if (result) {
                return [validTowel.towel, ...result]
            }
        }
    }

    checkDesigns(): {design: Design, towels: Towel[]}[] {
        let results: { design: Design, towels: Towel[] }[] = [];

        for (let design of this.designs) {
            let result = this.fitTowelsToDesign(design)
            if (result) {
                results.push({design, towels: result})
            }
        }
        return results
    }

    fitAllPossibleTowelsToDesign(design: Design): number {
        // Use memoization to avoid recalculating
        const key = design.sequence;
        if (this.memoizedResults.has(key)) {
            return this.memoizedResults.get(key)!;
        }

        let total = 0;
        let validTowels = this.findValidTowels(design);

        for (let { towel, remainingLength } of validTowels) {
            if (remainingLength === 0) {
                total += 1;
                continue;
            }

            if (remainingLength < 0) {
                continue; // Early termination for invalid matches
            }

            // Create new Design only when necessary
            total += this.fitAllPossibleTowelsToDesign(
                new Design(design.sequence.slice(design.sequence.length - remainingLength))
            );
        }

        // Store result in memo before returning
        this.memoizedResults.set(key, total);
        return total;
    }

    checkAllDesigns(): number {
        let total = 0;
        
        for (let design of this.designs) {
            // Clear memoization for each new design
            this.memoizedResults.clear();
            total += this.fitAllPossibleTowelsToDesign(design);
        }
        
        return total;
    }
}

function part1() {
    let input = readInput();
    let onsen = processData(input);
    // console.log(onsen)
    let designChecks = onsen.checkDesigns()
    console.log(designChecks)
    return designChecks.length;
}

function part2() {
    let input = readInput();
    let onsen = processData(input);
    // console.log(onsen)
    let designChecks = onsen.checkAllDesigns()
    console.log(designChecks)
    return designChecks;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);