import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): number[][] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => 
        line.split(' ').map(num => parseInt(num))
    );
}

function isAscending(report: number[]): boolean {
    let previous = report[0];
    for (let i of report.slice(1)) {
        if (!(previous < i && previous + 3 >= i)) { 
            return false;
        }
        previous = i;
    }
    return true;
}



function isSafe(report: number[]): boolean {
    return isAscending(report) || isAscending(report.reverse());
    
}

function part1() {
    let input = readInput();
    let data = processData(input);
    let safeCount = 0;
    for (let report of data) {
        if (isSafe(report)) {
            safeCount++;
        }
    }
    return safeCount;
}

function part2() {
    let input = readInput();
    let data = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);