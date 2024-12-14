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

    calculateAverageClosestNeighborDistance(): number {
        if (this.robots.length < 2) return 0;

        const distances = this.robots.map(robot1 => {
            // Find closest distance to any other robot
            const closestDistance = Math.min(...this.robots
                .filter(robot2 => robot1 !== robot2)
                .map(robot2 => {
                    const dx = Math.abs(robot1.position.x - robot2.position.x);
                    const dy = Math.abs(robot1.position.y - robot2.position.y);
                    return Math.sqrt(dx * dx + dy * dy);
                }));
            return closestDistance;
        });

        // Calculate median of all closest distances
        const sorted = distances.sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 === 0 
            ? (sorted[middle - 1] + sorted[middle]) / 2
            : sorted[middle];
        return median;
    }

}

function part1() {
    let input = readInput();
    let data = processData(input);

    // let bathroom = new Bathroom(data, 11, 7);
    let bathroom = new Bathroom(data, 101, 103);
    // bathroom.showRobots();
    for (let i = 0; i < 100 ; i++) {
        bathroom.moveRobots();
        bathroom.showRobots();
    }
    let safetyFactor = bathroom.calcluateSafetyFactor();
    // console.log(safetyFactor);

    return safetyFactor;
}

function part2() {
    let input = readInput();
    let data = processData(input);

    // let bathroom = new Bathroom(data, 11, 7);
    let bathroom = new Bathroom(data, 101, 103);
    for (let i = 0; i < 100000 ; i++) {
        bathroom.moveRobots();
        let averageDistance = bathroom.calculateAverageClosestNeighborDistance();
        if (averageDistance < 1.4) {
            bathroom.showRobots();
            console.log(`Average closest neighbor distance: ${averageDistance}`);
            console.log(bathroom.second)
            console.log()
        }
    }
    let safetyFactor = bathroom.calcluateSafetyFactor();
    // console.log(safetyFactor);

    return safetyFactor;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);