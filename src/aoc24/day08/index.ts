import { readFileSync } from 'fs';
import { join } from 'path';

interface MapData {
    antennas: Array<[string, number, number]>; // [frequency, x, y]
    dimensions: [number, number]; // [width, height]
}

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): MapData {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const antennas: Array<[string, number, number]> = [];
    
    const height = lines.length;
    const width = lines[0].length;

    for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
            const char = lines[y][x];
            if (char !== '.') {
                antennas.push([char, x, y]);
            }
        }
    }

    return {
        antennas,
        dimensions: [width, height]
    };
}

class Coord {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `Coord(${this.x}, ${this.y})`;
    }

    calculateDistance(other: Coord): CoordRelitive {
        return new CoordRelitive(this.x - other.x, this.y - other.y);
    }

    addRelitiveCoord(relitive: CoordRelitive): Coord {
        return new Coord(this.x + relitive.x, this.y + relitive.y);
    }

    minusRelitiveCoord(relitive: CoordRelitive): Coord {
        return new Coord(this.x - relitive.x, this.y - relitive.y);
    }

}

class CoordRelitive extends Coord {

    toString(): string {
        return `CoordRelitive(${this.x}, ${this.y})`;
    }
}


class Map {
    width: number; // x
    height: number; // y
    antennas: { [key: string]: Antenna[] } = {};
    antinodes: { [key: string]: Antinode[] } = {};

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    toString(): string {    
        return `Map(${this.width}, ${this.height})`;
    }

    addAntenna(antenna: Antenna): void {
        console.log(`Adding ${antenna.toString()}`);

        if (this.antennas[antenna.frequency] === undefined) {
            this.antennas[antenna.frequency] = [antenna];
            return;
        } 
        for (let otherAntenna of this.antennas[antenna.frequency]) {

            let antinodes = antenna.calculateAntinodes(otherAntenna);
            for (let antinode of antinodes) {
                if (this.isInBounds(antinode.loc)) {

                    if (this.antinodes[antinode.loc.toString()] === undefined) {
                        this.antinodes[antinode.loc.toString()] = [antinode];
                    } else {
                        this.antinodes[antinode.loc.toString()].push(antinode);
                    }
                }
            }
        }
        
        this.antennas[antenna.frequency].push(antenna);
    }

    
    addAllAntenna(antenna: Antenna): void {
        console.log(`Adding ${antenna.toString()}`);

        if (this.antennas[antenna.frequency] === undefined) {
            this.antennas[antenna.frequency] = [antenna];
            return;
        } 
        for (let otherAntenna of this.antennas[antenna.frequency]) {

            let antinodes = antenna.calculateAllAntinodes(otherAntenna);
            for (let antinode of antinodes) {
                if (this.isInBounds(antinode.loc)) {

                    if (this.antinodes[antinode.loc.toString()] === undefined) {
                        this.antinodes[antinode.loc.toString()] = [antinode];
                    } else {
                        this.antinodes[antinode.loc.toString()].push(antinode);
                    }
                }
            }
        }
        
        this.antennas[antenna.frequency].push(antenna);
    }

    isInBounds(coord: Coord): boolean {
        return coord.x >= 0 && coord.x < this.width && coord.y >= 0 && coord.y < this.height;
    }

    countAntinodes(): number {
        let count = 0;
        for (let key in this.antinodes) {
            count++;
        }
        return count;
    }

}

class Antenna {
    frequency: string;
    loc: Coord;
    map: Map;

    constructor(frequency: string, x: number, y: number, map: Map) {
        this.frequency = frequency;
        this.loc = new Coord(x, y);
        this.map = map;
    }

    toString(): string {
        return `Antenna(${this.frequency}, ${this.loc.toString()})`;
    }

    calculateAntinodes(otherAntenna: Antenna): Antinode[] {
        let antinodes: Antinode[] = [];

        let distance = this.loc.calculateDistance(otherAntenna.loc);
        let antinode = new Antinode(this.frequency, this.loc.x + distance.x, this.loc.y + distance.y)
        antinodes.push(antinode);
        
        distance = otherAntenna.loc.calculateDistance(this.loc);
        antinode = new Antinode(otherAntenna.frequency, otherAntenna.loc.x + distance.x, otherAntenna.loc.y + distance.y);
        antinodes.push(antinode);

        console.log(`Adding Antidnodes: ${antinodes}`);

        return antinodes;
    }

    
    calculateAllAntinodes(otherAntenna: Antenna): Antinode[] {
        let antinodes: Antinode[] = [new Antinode(this.frequency, this.loc.x, this.loc.y)];

        let distance = this.loc.calculateDistance(otherAntenna.loc);

        let nextAntinodeLoc = this.loc.addRelitiveCoord(distance);
        while (this.map.isInBounds(nextAntinodeLoc)) {
            let antinode = new Antinode(this.frequency, nextAntinodeLoc.x, nextAntinodeLoc.y);
            antinodes.push(antinode);
            nextAntinodeLoc = nextAntinodeLoc.addRelitiveCoord(distance);
        }

        nextAntinodeLoc = this.loc.minusRelitiveCoord(distance);
        while (this.map.isInBounds(nextAntinodeLoc)) {
            let antinode = new Antinode(this.frequency, nextAntinodeLoc.x, nextAntinodeLoc.y);
            antinodes.push(antinode);
            nextAntinodeLoc = nextAntinodeLoc.minusRelitiveCoord(distance);
        }
        
        return antinodes;
    }
}


class Antinode {
    loc: Coord;
    frequency: string;
    antennas: Antenna[];

    constructor(frequency: string, x: number, y: number) {
        this.loc = new Coord(x, y);
        this.antennas = [];
        this.frequency = frequency;
    }

    toString(): string {
        return `Antinode(${this.frequency}, ${this.loc.toString()})`;
    }


    addAntenna(antenna: Antenna): void {
        this.antennas.push(antenna);
    }
}


function part1() {
    let input = readInput();
    let data = processData(input);

    let map = new Map(data.dimensions[0], data.dimensions[1]);
    console.log(map.toString());

    for (let antennaData of data.antennas) {

        let antenna = new Antenna(antennaData[0], antennaData[1], antennaData[2], map);
        map.addAntenna(antenna);
    }

    return map.countAntinodes();
}


function part2() {
    let input = readInput();
    let data = processData(input);

    let map = new Map(data.dimensions[0], data.dimensions[1]);
    console.log(map.toString());

    for (let antennaData of data.antennas) {

        let antenna = new Antenna(antennaData[0], antennaData[1], antennaData[2], map);
        map.addAllAntenna(antenna);
    }

    return map.countAntinodes();
}


console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);