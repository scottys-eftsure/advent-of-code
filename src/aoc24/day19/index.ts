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

class Onsen {
    towels: Towel[];
    designs: Design[];

    constructor(towels: Towel[], designs: Design[]) {
        this.towels = towels
        this.designs = designs
    }

    toString() {
        return `Onsen(towels: ${this.towels.length}, designs: ${this.designs.length})`
    }

    findValidTowels(design: Design):  { towel: Towel, design: Design }[] {
        // console.log(design)
        let results: { towel: Towel, design: Design }[] = [];

        for (let towel of this.towels) {
            if (towel.pattern === design.sequence.slice(0, towel.pattern.length)) {
                results.push({
                    towel,
                    design: new Design(design.sequence.slice(towel.pattern.length))
                })
            }
        }
        return results
    }

    fitTowelsToDesign(design: Design): Towel[] | undefined {
        let towels: Towel[] = [];


        let validTowels = this.findValidTowels(design);

        for (let validTowel of validTowels) {
            if (validTowel.design.sequence.length === 0) {
                return [validTowel.towel]
            }

            let result = this.fitTowelsToDesign(validTowel.design)

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
}

function part1() {
    let input = readInput();
    let onsen = processData(input);
    console.log(onsen)
    let designChecks = onsen.checkDesigns()
    console.log(designChecks)
    return designChecks.length;
}

function part2() {
    let input = readInput();
    let onsen = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);