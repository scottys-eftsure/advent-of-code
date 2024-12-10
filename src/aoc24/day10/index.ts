import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): number[][] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => line.split('').map(Number));
}

class TopographicMap {
    map: Point[][] = [];
    points: Point[] = [];
    trailheads: Point[] = [];
    constructor(data: number[][]) {
        for (let y = 0; y < data.length; y++) {
            let rowPoints: Point[] = [];
            for (let x = 0; x < data[y].length; x++) {
                let point = new Point(data[y][x], x, y);
                rowPoints.push(point);
                this.points.push(point);
                if (point.height === 0) {
                    this.trailheads.push(point);
                }
            }
            this.map.push(rowPoints);
        }

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                let point = this.map[y][x];
                if (x > 0) {
                    point.addNeighbour(this.map[y][x - 1]);
                }
                if (x < this.map[y].length - 1) {
                    point.addNeighbour(this.map[y][x + 1]);
                }
                if (y > 0) {
                    point.addNeighbour(this.map[y - 1][x]);
                }
                if (y < this.map.length - 1) {
                    point.addNeighbour(this.map[y + 1][x]);
                }
            }
        }
    }

    toString(): string {
        return `TopographicMap(${this.map.length}x${this.map[0].length})`;
    }

    calculateTrailheadsScore(): number {
        let total = 0; 
        for (let trailhead of this.trailheads) {
            let trails = trailhead.calculateTrailScore(1, 9);
            total += trails.size
        }
        return total;
    }

    calculateTrailheadsRating(): number {
        console.log(this.trailheads)
        let total = 0; 
        for (let trailhead of this.trailheads) {
            let trails = trailhead.calculateTrailRating(1, 9);
            total += trails
        }
        return total;
    }
}

class Point {
    height: number;
    x: number;
    y: number;
    neighbours: Point[] = [];

    constructor(height: number, x: number, y: number) {
        this.height = height;
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `Point(height: ${this.height}, x: ${this.x}, y: ${this.y})`;
    }

    calculateSlopeToPoint(point: Point): number {
        return point.height - this.height;
    }

    addNeighbour(point: Point): void {
        this.neighbours.push(point);
    }

    neighboursWithSlope(slope: number): Point[] {
        let neighbours: Point[] = [];
        for (let neighbour of this.neighbours) {
            // console.log(neighbour.toString())
            // console.log(this.calculateSlopeToPoint(neighbour))
            if (this.calculateSlopeToPoint(neighbour) === slope) {
                neighbours.push(neighbour);
            }
        }
        return neighbours;
    }

    
    calculateTrailScore(slope: number, endHeight: number): Set<Point> {
        if (this.height === endHeight) {
            return new Set([this]);
        }
        let neighbours = this.neighboursWithSlope(slope);
        let foundSet = new Set<Point>();
        for (let neighbour of neighbours) {
            let found = neighbour.calculateTrailScore(slope, endHeight);
            found.forEach(point => foundSet.add(point));
        }
        return foundSet;
    }

    
    calculateTrailRating(slope: number, endHeight: number): number {
        if (this.height === endHeight) {
            return 1
        }

        let neighbours = this.neighboursWithSlope(slope);
        let foundRating = 0;
        for (let neighbour of neighbours) {
            let found = neighbour.calculateTrailRating(slope, endHeight);
            foundRating += found;
        }
        return foundRating;
    }
    
}


function part1() {
    let input = readInput();
    let data = processData(input);
    let map = new TopographicMap(data);
    let trails = map.calculateTrailheadsScore();
    return trails;
}

function part2() {
    let input = readInput();
    let data = processData(input);
    let map = new TopographicMap(data);
    let trails = map.calculateTrailheadsRating();
    return trails;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);