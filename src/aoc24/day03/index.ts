import { match } from 'assert';
import { readFileSync } from 'fs';
import { join } from 'path';

abstract class Instruction {
    constructor() { }
}

class Multiply extends Instruction {
    constructor(public a: number, public b: number) {
        super();
        this.a = a;
        this.b = b;
    }

    toString(): string {
        return `Multiply(a=${this.a}, b=${this.b})`;
    }
}

class Do extends Instruction {
    constructor() {
        super();
    }

    toString(): string {
        return `Do()`;
    }
}

class Dont extends Instruction {
    constructor() {
        super();
    }
    toString(): string {
        return `Dont()`;
    }
}

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): Multiply[] {

    const regex = /mul\((\d*),(\d*)\)/g;
    const matches = data.match(regex);

    let memoryUnits = [];
    for (let match of matches || []) {
            const [_, a, b] = match.match(/mul\((\d*),(\d*)\)/) || [];
            memoryUnits.push(new Multiply(parseInt(a, 10), parseInt(b, 10)));
    }

    return memoryUnits;
}


export function getInstructions(data: string): Instruction[] {

    const regex = /mul\((\d*),(\d*)\)|do\(\)|don\'t\(\)/g;
    const matches = data.match(regex);

    let memoryUnits = [];
    for (let match of matches || []) {
        if (match === 'do()') {
            memoryUnits.push(new Do());
            continue;
        } else if (match === 'don\'t()') {
            memoryUnits.push(new Dont());
            continue;
        } else {
            const [_, a, b] = match.match(/mul\((\d*),(\d*)\)/) || [];
            memoryUnits.push(new Multiply(parseInt(a, 10), parseInt(b, 10)));
        }
    }

    return memoryUnits;
}

export function getTotals(data: Multiply[]): number {
    let total: number = 0;
    for (let multiply of data) {
        total += multiply.a * multiply.b;
    }
    return total;
}

export function processInstructions(data: Instruction[]): number {
    let doMultiply: boolean = true;

    let total = 0;

    for (let instruction of data) {
        if (instruction instanceof Do) {
            doMultiply = true;
        } else if (instruction instanceof Dont) {
            doMultiply = false;
        } else if (instruction instanceof Multiply) {
            if (doMultiply) {
                total += instruction.a * instruction.b;
            }
        }
    }
    return total;
}

function part1() {
    let input = readInput();
    let data = processData(input);
    let totals = getTotals(data);
    return totals;
}

function part2() {
    let input = readInput();
    let data = getInstructions(input);
    let total = processInstructions(data);
    return total;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);