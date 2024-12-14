import { readFileSync } from 'fs';
import { join } from 'path';

interface Point {
    x: number;
    y: number;
}

interface InputData {
    position: Point;
    velocity: Point;
}

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): InputData[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
        // Parse each line in format "p=x,y v=dx,dy"
        const [posStr, velStr] = line.split(' ');
        
        // Extract position coordinates
        const [px, py] = posStr.substring(2).split(',').map(Number);
        
        // Extract velocity values
        const [vx, vy] = velStr.substring(2).split(',').map(Number);
        
        return {
            position: { x: px, y: py },
            velocity: { x: vx, y: vy }
        };
    });
}

class Coord {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    move(velocity: Velocity) {
        this.x = ((velocity.xd + this.x) % this.width + this.width) % this.width;
        this.y = ((velocity.yd + this.y) % this.height + this.height) % this.height;
    }


}

class Velocity {
    xd: number;
    yd: number;

    constructor(x: number, y: number) {
        this.xd = x;
        this.yd = y;
    }
}


class Robot {
    position: Coord;
    velocity: Velocity;

    constructor(startingPosition: Coord, velocity: Velocity) {
        this.position = startingPosition;
        this.velocity = velocity;
    }

    move() {
        this.position.move(this.velocity);
    }
}

class Bathroom {
    robots: Robot[];
    second: number;
    width: number;
    height: number;

    constructor(data: InputData[], width: number, height: number) {

        this.robots = data.map(robot => new Robot(new Coord(robot.position.x, robot.position.y, width, height), new Velocity(robot.velocity.x, robot.velocity.y)));
        this.second = 0;
        this.width = width;
        this.height = height;
    }

    moveRobots() {
        this.robots.forEach(robot => robot.move());
        this.second++;
    }

    showRobots() {
        let grid = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => 0));
        this.robots.forEach(robot => grid[robot.position.y][robot.position.x]++);
        console.log(grid.map(row => row.map(count => count === 0 ? '.' : count.toString()).join('')).join('\n'));
    }

    calcluateSafetyFactor() {
        // count robots per quadrant ignoring any exactly in the middle

        let quadrants = [0, 0, 0, 0]; // top-right, top-left, bottom-left, bottom-right
        const midX = Math.floor(this.width / 2);
        const midY = Math.floor(this.height / 2);

        this.robots.forEach(robot => {
            const x = robot.position.x;
            const y = robot.position.y;

            // Skip robots exactly in the middle
            if (x === midX || y === midY) {
                return;
            }

            if (x > midX && y < midY) {
                quadrants[0]++; // top-right
            } else if (x < midX && y < midY) {
                quadrants[1]++; // top-left  
            } else if (x < midX && y > midY) {
                quadrants[2]++; // bottom-left
            } else if (x > midX && y > midY) {
                quadrants[3]++; // bottom-right
            }
        });

        return quadrants.reduce((acc, val) => acc * val, 1);
        
    }
}

function part1() {
    let input = readInput();
    let data = processData(input);

    // let bathroom = new Bathroom(data, 11, 7);
    let bathroom = new Bathroom(data, 101, 103);
    bathroom.showRobots();
    for (let i = 0; i < 100 ; i++) {
        bathroom.moveRobots();
        // bathroom.showRobots();
    }
    let safetyFactor = bathroom.calcluateSafetyFactor();
    // console.log(safetyFactor);

    return safetyFactor;
}

function part2() {
    let input = readInput();
    let data = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);