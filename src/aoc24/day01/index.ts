import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): { column1: number[], column2: number[] } {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const column1: number[] = [];
    const column2: number[] = [];
    
    lines.forEach(line => {
        const [num1, num2] = line.trim().split(/\s+/).map(Number);
        column1.push(num1);
        column2.push(num2);
    });

    return { column1, column2 };
}

export function getDistance(column1: number[], column2: number[]): number {
    let sorted1 = column1.sort((a, b) => a - b);    
    let sorted2 = column2.sort((a, b) => a - b);

    let distances = [];

    for (let i = 0; i < sorted1.length; i++) {
        distances.push(Math.abs(sorted1[i] - sorted2[i]));
    }
    
    return distances.reduce((sum, current) => sum + current, 0);
}

function countOccurances(arr: number[]): Map<number, number> {
    let counts = new Map<number, number>();

    for (let item of arr) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
    }

    return counts;
}

function getSimilarity(column1: number[], column2: number[]): number {
    let occur1 = countOccurances(column1);
    let occur2 = countOccurances(column2);

    let scores: number[] = [];

    for (let [key, value] of occur1) {
        scores.push(key * value * (occur2.get(key) ?? 0));
    }

    return scores.reduce((sum, current) => sum + current, 0);
}

function part1() {
    let input = readInput();
    let cols = processData(input);
    let distance = getDistance(cols.column1, cols.column2);
    return distance;
}

function part2() {
    let input = readInput();
    let cols = processData(input);
    let similarity = getSimilarity(cols.column1, cols.column2);
    return similarity;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);