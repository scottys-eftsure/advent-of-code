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

export function getTotals(data: Multiply[]): number {
    let total: number = 0;
    for (let multiply of data) {
        total += multiply.a * multiply.b;
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
    let data = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);