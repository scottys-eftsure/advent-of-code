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

enum Direction {
    left = 'left',
    right = 'right',
    above = 'above',
    below = 'below'
}

function getPerpendicularDirections(direction: Direction): Direction[] {
    switch (direction) {
        case Direction.left:
        case Direction.right:
            return  [ Direction.above, Direction.below ];
        case Direction.above:
        case Direction.below:
            return [ Direction.left, Direction.right ];
    }
}

class Plant {
    type: string;
    plot!: Plot;
    x: number;
    y: number;
    neighbours: Map<Direction, Plant> = new Map();

    constructor(type: string, x: number, y: number) {
        this.type = type;
        this.x = x;
        this.y = y;
    }

    toString() {
        return `Plant(${this.type}, ${this.x}, ${this.y})`;
    }
    
    printNeighbours() {
        console.log('Neighbours for', this.toString());
        for (let [key, value] of this.neighbours) {
            if (value) {
                console.log(key, value.toString());
            }
        }
    }

    calculateSideSize(direction: Direction) {
        let sideSize = 0;
        if (this.neighbours.get(direction)?.plot === this.plot) {
            return sideSize;
        }
        sideSize++;

        for (let perpendicularDirection of getPerpendicularDirections(direction)) {
            let nextPlant = this.neighbours.get(perpendicularDirection);
            while (nextPlant && nextPlant.plot === this.plot && nextPlant.neighbours.get(direction)?.plot !== this.plot) {
                sideSize++;
                nextPlant = nextPlant.neighbours.get(perpendicularDirection);
            }
        }
        return sideSize;
    }

    getSidesSize() {

        return [
            this.calculateSideSize(Direction.left),
            this.calculateSideSize(Direction.right),
            this.calculateSideSize(Direction.above),
            this.calculateSideSize(Direction.below),
        ]
    }

}

class Plot {
    type: string;
    plants: Set<Plant> = new Set();
    plantsMap: { [key: string]: Plant } = {};

    constructor(startingPlant: Plant) {
        this.type = startingPlant.type;
        this.bulildPlot(startingPlant);
    }

    bulildPlot(plant: Plant) {
        
        this.addPlant(plant);
        for (let curPlant of plant.neighbours.values()) {
            if (curPlant && curPlant.type === this.type && !this.plants.has(curPlant)) {
                this.bulildPlot(curPlant);
            }
        }
    }

    addPlant(plant: Plant) {
        if (plant.type !== this.type) {
            throw new Error('Wrong plant type');
        }
        if (this.plants.has(plant)) {
            throw new Error('Plant already has a plot');
        }
        plant.plot = this;
        this.plants.add(plant);
        this.plantsMap[`${plant.x},${plant.y}`] = plant;
    }

    toString() {
        return `Plot(type: ${this.type}, area: ${this.area}, perimeter: ${this.perimeter}: price: ${this.price}, sides: ${this.sides}, discountPrice: ${this.discountPrice})`;
    }

    get area() {
        return this.plants.size;
    }

    get perimeter() {
        let perimeter = 0;
        for (let plant of this.plants) {
            for (let neighbour of plant.neighbours.values()) {
                if (!neighbour || neighbour.plot !== this) {
                    perimeter++;
                }
            }
        }
        return perimeter;
    }

    get price() {
        return this.area * this.perimeter;
    }

    get sides() {
        let sidesSizeCount: Map<number, number> = new Map();
        for (let plant of this.plants) {
            let sidesSize = plant.getSidesSize();
            for (let sideSize of sidesSize) {
                if (sideSize > 0) {
                    sidesSizeCount.set(sideSize, (sidesSizeCount.get(sideSize) ?? 0) + 1);
                }
            }
        }
        let sides = 0;
        for (let [key, value] of sidesSizeCount) {
            sides += value / key;
        }
        return sides;
    }

    get discountPrice() {
        // return -1;
        return this.area * this.sides;
    }
}

class Farm {
    plants: { [key: string]: Plant } = {};
    plots: Plot[] = [];
    height: number;
    width: number;

    constructor(layout: string[][]) {
        this.height = layout.length;
        this.width = layout[0].length

        this.plants = this.convertToPlants(layout);
        this.connectPlants();
        this.createPlots();
        
    }

    private convertToPlants(layout: string[][]): { [key: string]: Plant } {
        let plants: { [key: string]: Plant } = {};
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                const type = layout[y][x];
                plants[`${x},${y}`] = new Plant(type, x, y);
            }
        }
        return plants;
    }
    private connectPlants() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let plant = this.plants[`${x},${y}`];
                plant.neighbours.set(Direction.left, this.plants[`${x - 1},${y}`]);
                plant.neighbours.set(Direction.right, this.plants[`${x + 1},${y}`]);
                plant.neighbours.set(Direction.above, this.plants[`${x},${y - 1}`]);
                plant.neighbours.set(Direction.below, this.plants[`${x},${y + 1}`]);
            }
        }
    }

    private createPlots() {
        for (let plant of Object.values(this.plants)) {
            if (!plant.plot) {
                let plot = new Plot(plant);
                this.plots.push(plot);
            }
        }
    }


    toString() {
        let result = '';
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                result += this.plants[`${x},${y}`].toString();
            }
            result += '\n';
        }
        return result;
    }

    printPlots() {
        for (let plot of this.plots) {
            console.log(plot.toString());
        }
    }

    get price() {
        return this.plots.reduce((acc, plot) => acc + plot.price, 0);
    }

    get dicountPrice() {
        return this.plots.reduce((acc, plot) => acc + plot.discountPrice, 0);
    }
}

function part1() {
    let input = readInput();
    let grid = processData(input);
    let farm = new Farm(grid);
    return farm.price;
}

function part2() {
    let input = readInput();
    let grid = processData(input);
    let farm = new Farm(grid);
    farm.plots[0].sides;
    // console.log(farm.plots);
    farm.printPlots();
    return farm.dicountPrice;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);