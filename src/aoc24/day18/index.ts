import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): Coord[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
        const [x, y] = line.split(',').map(n => parseInt(n));
        return new Coord(x, y);
    });
}

class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `${this.x},${this.y}`;
    }

    equals(other: Coord): boolean {
        return this.x === other.x && this.y === other.y;
    }

    manhattan(other: Coord): number {
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
    }

    neighbors(): Coord[] {
        return [
            new Coord(this.x + 1, this.y),
            new Coord(this.x - 1, this.y),
            new Coord(this.x, this.y + 1),
            new Coord(this.x, this.y - 1)
        ];
    }
}

class MemorySpace {
    toFall: Coord[];
    corrupted: { [key: string]: Coord } = {};
    height: number;
    width: number;

    constructor(corrupted: Coord[], height: number, width: number) {
        this.toFall = corrupted;
        this.height = height;
        this.width = width;
    }

    findShortestPath(time: number): number {
        const lastCorrupted = this.corrupt(time);
        
        console.log(`last corrupted: ${lastCorrupted?.toString()}`);
        
        const start = new Coord(0, 0);
        const goal = new Coord(this.width - 1, this.height - 1);
        
        const openSet = new Set<string>([start.toString()]);
        const cameFrom = new Map<string, Coord>();
        
        const gScore = new Map<string, number>();
        gScore.set(start.toString(), 0);
        
        const fScore = new Map<string, number>();
        fScore.set(start.toString(), start.manhattan(goal));
        
        while (openSet.size > 0) {
            let current: Coord | null = null;
            let lowestFScore = Infinity;
            
            // Find node with lowest fScore
            for (const nodeStr of openSet) {
                const f = fScore.get(nodeStr) ?? Infinity;
                if (f < lowestFScore) {
                    const [x, y] = nodeStr.split(',').map(n => parseInt(n));
                    current = new Coord(x, y);
                    lowestFScore = f;
                }
            }
            
            if (!current) break;
            
            if (current.equals(goal)) {
                // Path found - reconstruct length
                let pathLength = 0;
                let currentNode = current;
                while (cameFrom.has(currentNode.toString())) {
                    currentNode = cameFrom.get(currentNode.toString())!;
                    pathLength++;
                }
                return pathLength;
            }
            
            openSet.delete(current.toString());
            
            for (const neighbor of current.neighbors()) {
                // Skip if out of bounds or corrupted
                if (neighbor.x < 0 || neighbor.x >= this.width ||
                    neighbor.y < 0 || neighbor.y >= this.height ||
                    this.corrupted[neighbor.toString()]) {
                    continue;
                }
                
                const tentativeGScore = (gScore.get(current.toString()) ?? Infinity) + 1;
                
                if (tentativeGScore < (gScore.get(neighbor.toString()) ?? Infinity)) {
                    cameFrom.set(neighbor.toString(), current);
                    gScore.set(neighbor.toString(), tentativeGScore);
                    fScore.set(neighbor.toString(), tentativeGScore + neighbor.manhattan(goal));
                    openSet.add(neighbor.toString());
                }
            }
        }
        return -1; // No path found
    }

    corrupt(amount: number) {
        for (let i = 0; i < amount; i++) {
            let coord = this.toFall.shift();
            if (coord) {
                this.corrupted[coord.toString()] = coord;
                return coord;
            }
        }
        return null;
    }

    toString() {
        return `MemorySpace(yetToFall: ${this.toFall.length}, corrupted: ${Object.keys(this.corrupted).length}, height: ${this.height}, width: ${this.width})`;
    }
}


function part1() {
    let input = readInput();
    let data = processData(input);
    // let memorySpace = new MemorySpace(data, 7, 7);
    let memorySpace = new MemorySpace(data, 71, 71);
    console.log(memorySpace.toString());
    // return memorySpace.findShortestPath(12);
    return memorySpace.findShortestPath(1024);
}

function part2() {
    let input = readInput();
    let data = processData(input);
    let total = data.length
    // let memorySpace = new MemorySpace(data, 7, 7);
    let memorySpace = new MemorySpace(data, 71, 71);
    console.log(memorySpace.toString());
    // return memorySpace.findShortestPath(12);
    for (let i = 0; i < total; i++) {
        let path = memorySpace.findShortestPath(1);
        
        console.log(`returned ${path} for memorySpace: ${memorySpace.toString()}`);
        if (path === -1) {
            return i;
        }
    }
    return -1;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);