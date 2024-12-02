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
    return isAscending(report) || isAscending([...report].reverse());
}


// Leaving this here as a cautionary tale for all those who thought they were 
// a too smart for their own good rather than just brute forcing it...
function isMosltyAscending(report: number[]): boolean {
    let previous = report[0];
    let badCount = 0;

    // checking if the first or last can be removed
    if (isSafe(report.slice(1)) || isSafe(report.slice(0, -1))) {
        return true;
    }

    for (let i of report.slice(1)) {
        if (!(previous < i && previous + 3 >= i)) { 
            if (badCount >= 1) {
                return false;
            } else {
                badCount++;
            }
        } else {
            // keep previous the same if the last case was bad
            previous = i;
        } 
    }

    return true;
}

function isMostlySafe(report: number[]): boolean { // Could use generics here?
    for (let i = 0; i < report.length; i++) {
        let removeOne = [...report.slice(0, i), ...(report.slice(i + 1))];
        if (isSafe(removeOne)) {
            return true;
        }
    }
    return false;
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
    let safeCount = 0;
    for (let report of data) {
        if (isMostlySafe(report)) {
            safeCount++;
        }
    }
    return safeCount;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);