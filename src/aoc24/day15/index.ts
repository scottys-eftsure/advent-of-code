import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): { grid: string[][], instructions: string[] } {
    const [gridSection, instructionsSection] = data.split('\n\n');
    
    // Process the grid section
    const grid = gridSection
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.split(''));

    // Process the instructions section into an array of characters
    const instructions = instructionsSection
        .trim()
        .split('')
        .filter(char => char !== '\n');

    return { grid, instructions };
}

class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getNewPosition(direction: Instruction): Coord {
        return new Coord(this.x + direction.x, this.y + direction.y);
    }

    toString() {
        return `${this.x},${this.y}`;
    }
}



abstract class Item {
    coord: Coord;

    constructor(position: Coord) {
        this.coord = position;
    }

    abstract toString(): string;
}

abstract class Movable extends Item {
    movable = true;
    
    move(instruction: Instruction): Coord {
        this.coord = this.coord.getNewPosition(instruction);
        return this.coord;
    }
}

class Robot extends Movable {

    constructor(position: Coord) {
        super(position);
    }

    toString() {
        return '@';
    }
}

class Box extends Movable {

    constructor(position: Coord) {
        super(position);
    }

    toString() {
        return 'O';
    }
}

class Wall extends Item {

    constructor(position: Coord) {
        super(position);
    }

    toString() {
        return '#';
    }
}

enum InstructionDirection {
    LEFT = '<',
    RIGHT = '>',
    UP = '^',
    DOWN = 'v'
}

class Instruction {
    x: number;
    y: number;
    direction: InstructionDirection;

    constructor(instruction: string) {
        this.x = instruction === '<' ? -1 : instruction === '>' ? 1 : 0;
        this.y = instruction === '^' ? -1 : instruction === 'v' ? 1 : 0;
        this.direction = instruction as InstructionDirection;
    }
}

class Warehouse {
    robot!: Robot;
    grid: { [key: string]: Item };
    instructions: Instruction[];
    height: number;
    width: number;

    constructor(grid: string[][], instructions: string[]) {
        this.grid = {};
        this.instructions = [];
        this.height = grid.length;
        this.width = grid[0].length;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const type = grid[y][x];
                let coord = new Coord(x, y);
                if (type === 'O') {
                    this.grid[coord.toString()] = new Box(coord);
                } else if (type === '@') {
                    this.robot = new Robot(coord);
                    this.grid[coord.toString()] = this.robot;
                } if (type === '#') {
                    this.grid[coord.toString()] = new Wall(coord);
                }
            }
        }

        for (const instruction of instructions) {
            this.instructions.push(new Instruction(instruction));
        }
    }

    getNeighbour(obj: Item, instruction: Instruction) {
        return this.grid[obj.coord.getNewPosition(instruction).toString()];
    }

    moveObject(obj: Movable, direction: Instruction) {
        delete this.grid[obj.coord.toString()];
        obj.move(direction);
        this.grid[obj.coord.toString()] = obj;
    }

    moveObjects(obj: Item, direction: Instruction): boolean {
        // console.log(obj);
        if (!(obj instanceof Movable)) return false;

        const neighbour = this.getNeighbour(obj, direction);
        if (neighbour === undefined) {
            this.moveObject(obj, direction);
            return true;
        }

        let movable = this.moveObjects(neighbour, direction);
        if (movable) {
            this.moveObject(obj, direction);
        }
        return movable;
    }

    completeInstructions() {
        for (const instruction of this.instructions) {
            // console.log(instruction, this.robot.coord);
            this.moveObjects(this.robot, instruction);
        }
    }

    calculateBoxScore() {
        let score = 0;
        for (const box of Object.values(this.grid)) {
            if (box instanceof Box) {
                score += box.coord.x + (box.coord.y * 100);
            }
        }
        return score;
    }

    showWarehouse() {
        for (let y = 0; y < this.height; y++) {
            let line = '';
            for (let x = 0; x < this.width; x++) {
                const item = this.grid[`${x},${y}`];
                if (item instanceof Item) { 
                    line += item.toString();
                } else {
                    line += '.';
                }
            }
            console.log(line);
        }
    }
}


function part1() {
    let input = readInput();
    let data = processData(input);
    const warehouse = new Warehouse(data.grid, data.instructions);
    warehouse.completeInstructions();
    // warehouse.showWarehouse();
    // console.log(warehouse.calculateBoxScore());
    return warehouse.calculateBoxScore();
}

function part2() {
    // let input = readInput();
    // let data = processData(input);
    // return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);