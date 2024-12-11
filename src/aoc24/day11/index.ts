import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): number[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines[0].split(' ').map(Number);
}

class Line {
    startStone: Stone;
    endStone: Stone;

    constructor(initialValues: number[]) {
        let stone = new Stone(initialValues[0]);
        this.startStone = stone;
        this.endStone = stone;
        for (let val of initialValues.slice(1)) {
            this.pushStone(val);
        }
    }

    pushStone(value: number) {
        let stone = new Stone(value);
        this.endStone.addNext(stone);
        this.endStone = stone;
    }

    length() {
        let count = 1;
        let stone = this.startStone;
        while (stone.next) {
            count++;
            stone = stone.next;
        }
        return count;
    }

    blink() {
        let stone: Stone | undefined = this.startStone;
        let stones: Stone[] = stone.blink();
        // console.log(stones);
        this.startStone = stones[0];
        stone = stone.next;
        while (stone) {
            stones = stone.blink();
            stone = stone.next;
        }
        this.endStone = stones[stones.length - 1];
        // console.log(this.toString());
    }

    toString() {
        let stone: Stone | undefined = this.startStone;
        let result = 'Line: \n';
        while (stone) {
            result += `  -> ${stone.toString()}\n`;
            stone = stone.next;
        }
        return result;

    }
}


class Stone {
    value: number;
    prev: Stone | undefined;
    next: Stone | undefined;
    constructor (value: number, prev?: Stone, next?: Stone) {
        this.value = value;
        this.prev = prev;
        this.next = next;
    }

    addNext(next: Stone) {
        this.next = next;
        next.prev = this;
    }

    toString() {
        return `Stone(val: ${this.value})`;
    }

    spilt(): Stone[] {
        let valString = this.value.toString();

        if (valString.length % 2 === 1) {
            throw new Error('Cannot split stone with odd value');
            
        }

        const mid = valString.length / 2;
        const firstHalf = new Stone(Number(valString.slice(0, mid)));
        const secondHalf = new Stone(Number(valString.slice(mid)));
        // console.log(`Splitting ${this.value} into ${firstHalf.value} and ${secondHalf.value}`);

        if (this.prev) {
            this.prev.addNext(firstHalf);
        }
        firstHalf.addNext(secondHalf);
        if (this.next) {    
            secondHalf.addNext(this.next);
        }

        return [firstHalf, secondHalf];
    }

    blink(): Stone[] {
        let valString = this.value.toString();
        if (this.value === 0) {
            this.value = 1;
            return [this];
        } else if (valString.length % 2 === 0) {
            // console.log(`Splitting ${this.value}`);
            return this.spilt();

        } else {
            this.value *= 2024;
            return [this];
        }
    }
}

class LineMap {
    stones: Map<number, number> = new Map();

    constructor(initialValues: number[]) {
        for (let val of initialValues) {
            this.addStone(val, 1);
        }
    }

    addStone(value: number, total: number) {
        this.stones.set(value, (this.stones.get(value) ?? 0) + total);
    }

    removeStone(value: number, total: number) {
        if (this.stones.has(value)) {
            let count = this.stones.get(value) ?? 0;
                this.stones.set(value, count - total);
            if (this.stones.get(value) === 0) {
                this.stones.delete(value);
            }
        }
    }

    length() {
        let length = 0;
        for (let [key, value] of this.stones) {
            length += value;
        }
        return length;
    }

    blink() {
        const entries = Array.from(this.stones.entries());
        for (let [key, value] of entries) {
            this.blinkStone(key, value);
        }
        // console.log(this.toString());
    }

    
    spiltStone(value: number, total: number) {
        let valString = value.toString();

        if (valString.length % 2 === 1) {
            throw new Error('Cannot split stone with odd value');
        }

        const mid = valString.length / 2;
        this.addStone(Number(valString.slice(0, mid)), total);
        this.addStone(Number(valString.slice(mid)), total);
        // console.log(`Splitting ${this.value} into ${firstHalf.value} and ${secondHalf.value}`);
    }

    blinkStone(value: number, total: number) {
        let valString = value.toString();
        if (value === 0) {
            this.addStone(1, total);
        } else if (valString.length % 2 === 0) {
            this.spiltStone(value, total);
        } else {
            this.addStone(value * 2024, total);
        }
        this.removeStone(value, total);
    }

    toString() {
        let result = 'Line: \n'
        for (let [key, value] of this.stones) {
            result += `  -> ${key}: ${value}\n`;
        }
        // result += this.stones;
        return result;

    }
}

function part1() {
    let input = readInput();
    let data = processData(input);
    let line = new Line(data);
    
    for (let i = 0; i < 25; i++) {
        // console.log(`Iteration ${i}`);
        line.blink();
    }
    return line.length();
}

function part2() {
    let input = readInput();
    let data = processData(input);
    let line = new LineMap(data);
    // console.log(line.toString());
    
    for (let i = 0; i < 75; i++) {
        // console.log(`Iteration ${i}`);
        line.blink();
        // console.log(line.length());
    }
    // console.log(line.toString());
    return line.length();
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);