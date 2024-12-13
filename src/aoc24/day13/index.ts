import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

interface ButtonData {
    buttonA: { x: number, y: number };
    buttonB: { x: number, y: number };
    prize: { x: number, y: number };
}

export function processData(data: string): ButtonData[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const games: ButtonData[] = [];
    
    for (let i = 0; i < lines.length; i += 3) {
        const buttonA = parseButton(lines[i]);
        const buttonB = parseButton(lines[i + 1]);
        const prize = parsePrize(lines[i + 2]);
        
        games.push({ buttonA, buttonB, prize });
    }
    
    return games;
}

function parseButton(line: string): { x: number, y: number } {
    const match = line.match(/X\+(\d+), Y\+(\d+)/);
    if (!match) throw new Error(`Invalid button format: ${line}`);
    return {
        x: parseInt(match[1]),
        y: parseInt(match[2])
    };
}

function parsePrize(line: string): { x: number, y: number } {
    const match = line.match(/X=(\d+), Y=(\d+)/);
    if (!match) throw new Error(`Invalid prize format: ${line}`);
    return {
        x: parseInt(match[1]),
        y: parseInt(match[2])
    };
}

class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class CoordDelta {
    xd: number;
    yd: number;

    constructor(xd: number, yd: number) {
        this.xd = xd;
        this.yd = yd;
    }
}

class Button {
    delta: CoordDelta;
    cost: number;

    constructor(x: number, y: number, cost: number) {
        this.delta = new CoordDelta(x, y);
        this.cost = cost;
    }
}

class Machine {
    buttonA: Button;
    buttonB: Button;
    prize: Coord;
    claw: Coord = new Coord(0, 0);
    
    constructor( props: ButtonData ) {
        this.buttonA = new Button(props.buttonA.x, props.buttonA.y, 3);
        this.buttonB = new Button(props.buttonB.x, props.buttonB.y, 1);
        this.prize = new Coord(props.prize.x, props.prize.y);
    }

    moveClaw(button: Button) {
        this.claw.x += button.delta.xd;
        this.claw.y += button.delta.yd;
    }

    solveLinearEquations(): { a: number, b: number } | null {

        const targetX = this.prize.x;
        const targetY = this.prize.y 
        
        const y1 = this.buttonA.delta.yd;
        const y2 = this.buttonB.delta.yd;
        const x1 = this.buttonA.delta.xd;
        const x2 = this.buttonB.delta.xd;
        
        const determinant = (y1 * x2) - (y2 * x1);
        
        if (determinant === 0) {
            return null; // No unique solution exists
        }
        
        const a = ((targetY * x2) - (y2 * targetX)) / determinant;
        const b = ((y1 * targetX) - (targetY * x1)) / determinant;
        
        // Check if solutions are non-negative integers
        if (Math.floor(a) !== a || Math.floor(b) !== b || a < 0 || b < 0) {
            return null;
        }
        
        return { a: a, b: b };
    }

    calcCost() {
        const moves = this.solveLinearEquations();
        if (!moves) {
            return 0;
        }
        return this.buttonA.cost * moves.a + this.buttonB.cost * moves.b;
    }
}

function part1() {
    let input = readInput();
    let games = processData(input);
    let totalCost = 0;
    for (let game of games) {
        let machine = new Machine(game);
        totalCost += machine.calcCost();
    }
    return totalCost;
}

function part2() {
    let input = readInput();
    let games = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);