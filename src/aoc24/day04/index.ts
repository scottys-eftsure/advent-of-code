import { count } from 'console';
import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): WordSearch {

    const lines = data.split('\n').filter(line => line.trim() !== '');
    const charGrid: string[][] = lines.map(line => line.split(''));
    return new WordSearch(charGrid);
    
}

class WordSearch {
    letters: Letter[][];
    constructor(letters: string[][]) { 
        this.letters = letters.map((row, y) => 
            row.map((val, x) => new Letter(val, x, y))
        );

    }

    findWordCount(word: string): number {
        let count = 0;
        for (let letter of this.letters.flat()) {
            if (letter.val === word[0]) {
                for (let xDir = -1; xDir <= 1; xDir++) {
                    for (let yDir = -1; yDir <= 1; yDir++) {
                        if (xDir === 0 && yDir === 0) {
                            continue;
                        }

                        if (this.isWordAt(word, letter, xDir, yDir)) {
                            console.log(`Found word at ${letter} with xDir=${xDir}, yDir=${yDir}`);
                            count++;
                        }
                    }
                }

            }
        }

        return count;
    }

    isWordAt(word: string, startingLetter: Letter, xDir: number, yDir: number): boolean {
        if (word[0] !== startingLetter.val) {
            return false;
        } 

        if (word.length === 1) {
            return true;
        }

        let nextLetter = this.getLetter(startingLetter.x + xDir, startingLetter.y + yDir);
        if (!nextLetter) {
            return false;
        }

        return this.isWordAt(word.slice(1), nextLetter, xDir, yDir);
    }

    getLetter(x: number, y: number): Letter | null {
        if (y < 0 || y >= this.letters.length) {
            return null;
        }
        if (x < 0 || x >= this.letters[y].length) {
            return null;
        }

        return this.letters[y][x];
    }


}

class Letter {
    val: string;
    x: number;
    y: number;
    constructor(val: string, x: number, y: number) { 
        this.val = val;
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `Letter(${this.val}, x=${this.x}, y=${this.y})`;
    }
}

function part1() {
    let input = readInput();
    let workSearch = processData(input);

    return workSearch.findWordCount('XMAS');
}

function part2() {
    let input = readInput();
    let data = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
// console.log(`Part 2 Answer: ${part2()}`);