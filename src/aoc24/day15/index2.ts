import { listen } from 'bun';
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
    coords: Coord[];
    type: string;

    constructor(positions: Coord[], type: string) {
        this.coords = positions;
        this.type = type;
    }

    toString(): string {
        return this.type;
    }
}

abstract class Movable extends Item {
    movable = true;
    
    move(instruction: Instruction): Coord[] {
        this.coords = this.coords.map(coord => coord.getNewPosition(instruction));
        return this.coords;
    }
}

class Robot extends Movable {}

class Box extends Movable {}

class Wall extends Item {}

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

class PhatWarehouse {
    robot!: Robot;
    grid: { [key: string]: Item };
    boxes: Box[] = [];
    instructions: Instruction[];
    height: number;
    width: number;

    constructor(grid: string[][], instructions: string[]) {
        this.grid = {};
        this.instructions = [];
        this.height = grid.length;
        this.width = grid[0].length * 2;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const type = grid[y][x];
                let coordL = new Coord(x * 2, y);
                let coordR = new Coord(x * 2 + 1, y);
                if (type === 'O') {
                    let box = new Box([coordL, coordR], type);
                    this.grid[coordL.toString()] = box;
                    this.grid[coordR.toString()] = box;
                    this.boxes.push(box);
                } else if (type === '@') {
                    let robot = new Robot([coordL], type);
                    this.robot = robot;
                    this.grid[coordL.toString()] = this.robot;
                } if (type === '#') {
                    this.grid[coordL.toString()] = new Wall([coordL], type);
                    this.grid[coordR.toString()] = new Wall([coordR], type);
                }
            }
        }

        for (const instruction of instructions) {
            this.instructions.push(new Instruction(instruction));
        }
    }

    getMovableNeighbours(obj: Item, instruction: Instruction): Set<Movable> | undefined {
        let neighbours = new Set<Movable>();
        for (const coord of obj.coords) {
            let neighbour = this.grid[coord.getNewPosition(instruction).toString()];
            if (neighbour && neighbour !== obj) {
                if (!(neighbour instanceof Movable)) {
                    return undefined;
                }
                let additionalNeighbours = this.getMovableNeighbours(neighbour, instruction);
                if (!additionalNeighbours) {
                    return undefined;
                }
                for (const n of additionalNeighbours) {
                    neighbours.add(n);
                }
                neighbours.add(neighbour);
            }
        }
        return neighbours;
    }

    moveObject(obj: Movable, direction: Instruction) {
        for (const coord of obj.coords) {
            delete this.grid[coord.toString()];
        }
        obj.move(direction);
        for (const coord of obj.coords) {
            this.grid[coord.toString()] = obj;
        }
    }

    moveObjects(obj: Item, direction: Instruction): boolean {
        // console.log(obj);
        if (!(obj instanceof Movable)) return false;

        const neighbours = this.getMovableNeighbours(obj, direction);
        if (!neighbours) {
            return false;
        }

        this.moveObject(obj, direction);
        for (const neighbour of neighbours) {
            this.moveObject(neighbour, direction);
        }
        return true;
    }

    completeInstructions() {
        for (const instruction of this.instructions) {
            // console.log(instruction, this.robot.coord);
            this.moveObjects(this.robot, instruction);
        }
    }

    calculateBoxScore() {
        let score = 0;
        for (const box of this.boxes) {
            score += box.coords[0].x + (box.coords[0].y * 100);
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


// function part1() {
//     let input = readInput();
//     let data = processData(input);
//     const warehouse = new PhatWarehouse(data.grid, data.instructions);
//     warehouse.completeInstructions();
//     // warehouse.showWarehouse();
//     // console.log(warehouse.calculateBoxScore());
//     return warehouse.calculateBoxScore();
// }

function part2() {
    let input = readInput();
    let data = processData(input);
    const warehouse = new PhatWarehouse(data.grid, data.instructions);
    // for (const item of Object.values(warehouse.grid)) {
    //     if (item instanceof Box) {
    //         console.log(item.coords);
    //     }
    // }
    warehouse.showWarehouse();
    warehouse.completeInstructions();
    warehouse.showWarehouse();
    // console.log(warehouse.calculateBoxScore());
    return warehouse.calculateBoxScore();
}

// console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);