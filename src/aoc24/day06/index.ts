import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): string[][] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => line.split(''));
}

function buildLab(data: string[][]): { guard: Guard; lab: Lab } {
    let lab = new Lab(new Coord(data[0].length, data.length));
    let guard!: Guard;
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[y].length; x++) {
            let loc = new Coord(x, y);
            switch (data[y][x]) {
                case '^':
                    guard = new Guard(loc, lab);
                    break;
                case '#':
                    lab.addObstruction(loc);
                    break;
            }
        }
    }
    return { guard, lab };
}

class Lab {
    bound: Coord;
    obstructions: { [key: string]: Obstruction } = {};
    tempObstruction: Coord | undefined;

    constructor(bound: Coord) {  
        this.bound = bound;
    }

    addObstruction(loc: Coord): Obstruction {
        let obstruction = new Obstruction(loc);
        this.obstructions[loc.toString()] = obstruction;
        return obstruction;
    }

    getObstruction(loc: Coord): Obstruction | undefined {
        return this.obstructions[loc.toString()];
    }

    toString(): string { 
        return `Lab(bound: ${this.bound})`;   
    }
    
    removeObstruction(loc: Coord): void {
        delete this.obstructions[loc.toString()];
    }

    addTempObstruction(loc: Coord): Obstruction {
        let obstruction = this.addObstruction(loc);

        if (this.tempObstruction !== undefined) {
            this.removeObstruction(this.tempObstruction);
        }
        this.tempObstruction = loc;

        return obstruction;
    }


}

class Coord {
    x: number;
    y: number;
    constructor(x: number, y: number) { 
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `(${this.x},${this.y})`;
    }

    compare(other: Coord): boolean {
        return this.x === other.x && this.y === other.y;
    }

    getNeighbor(dir: Direction): Coord {
        switch (dir) {
            case Direction.up:
                return new Coord(this.x, this.y - 1);
            case Direction.down:
                return new Coord(this.x, this.y + 1);
            case Direction.left:
                return new Coord(this.x - 1, this.y);
            case Direction.right:
                return new Coord(this.x + 1, this.y);
        }
    }
}

enum Direction {
    up = 'UP',
    down = "DOWN",
    left = "LEFT",
    right = "RIGHT",
}

class Guard {
    loc: Coord;
    dir: Direction;
    lab: Lab;
    visited: { [key: string]: { loc: Coord, dir: Direction } } = {};

    constructor(start: Coord, lab: Lab) {   
        this.loc = start;
        this.dir = Direction.up;
        this.lab = lab;
        this.addVisitedCurrent();
    }

    move(): boolean {
        // console.log(this.toString());
        if (this.checkColision()) {
            this.turnRight();
        } else {
            this.loc = this.loc.getNeighbor(this.dir);
        }
        if (this.isInLoop()) {
            return false;
        }
        if (this.isInLab()) {
            this.addVisitedCurrent();
            return true;
        } else {
            return false;
        }
        // return this.isInLab() && !this.isInLoop();
    }

    addVisitedCurrent() {
        this.visited[`${this.loc.toString()}, ${this.dir}`] = { loc: this.loc, dir: this.dir };
    }


    turnRight() {
        switch (this.dir) {
            case Direction.up:
                this.dir = Direction.right;
                break;
            case Direction.down:
                this.dir = Direction.left;
                break;
            case Direction.left:
                this.dir = Direction.up;
                break;
            case Direction.right:
                this.dir = Direction.down;
                break;
        }
    }

    checkColision(): boolean {
        let facingCoord = this.loc.getNeighbor(this.dir);
        let obstruction = this.lab.getObstruction(facingCoord);
        return obstruction !== undefined;
    }

    toString(): string {
        return `Guard(loc: ${this.loc}, dir: ${this.dir})`;
    }

    isInLab(): boolean {
        return this.loc.x >= 0 && this.loc.x < this.lab.bound.x && this.loc.y >= 0 && this.loc.y < this.lab.bound.y;
    }

    getCountVisited(): number {
        const distinctLocs = new Set<string>();
        for (const key in this.visited) {
            distinctLocs.add(this.visited[key].loc.toString());
        }
        return distinctLocs.size;
    }

    isInLoop(): boolean {
        return this.visited[`${this.loc.toString()}, ${this.dir}`] !== undefined;
    }

    
}

class Obstruction {
    loc: Coord;
    constructor(loc: Coord) {    
        this.loc = loc;
    }
}



function part1() {
    let input = readInput();
    let grid = processData(input);
    let { guard, lab } = buildLab(grid);
    while (guard.move()) {}
    return guard.getCountVisited();
}

function part2() {
    let input = readInput();
    let grid = processData(input);
    let { guard, lab } = buildLab(grid);

    // console.log(guard.toString());

    // console.log(lab.obstructions)
    // lab.addTempObstruction(new Coord(0, 0));
    // console.log(lab.obstructions)
    // lab.addTempObstruction(new Coord(0, 1));
    // console.log(lab.obstructions)
    let locations = new Set<string>();
    while (guard.move()) {
        
        let { guard: curGuard, lab: curLab } = buildLab(grid);
        curLab.addTempObstruction(guard.loc.getNeighbor(guard.dir));
        while (curGuard.move()) {}
        if (curGuard.isInLoop()) {
            locations.add(guard.loc.getNeighbor(guard.dir).toString());
        }
    }
    console.log(locations);
    console.log(locations.size);

    return locations.size;


}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);
// (3, 6), (6, 7), (7, 7), (1, 8), (3, 8), (7, 9)