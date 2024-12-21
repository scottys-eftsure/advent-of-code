import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): string[][] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    let map: string[][] = []
    for (let i = 0; i < lines.length; i++) {
        let row: string[] = []
        for (let j = 0; j < lines[i].length; j++) {
            row.push(lines[i][j])
        }
        map.push(row)
    }
    return map
}

class Track {
    map: Map<string, Node> = new Map()
    track: PathNode[] = []
    start: PathNode;
    end: PathNode;

    constructor(map: string[][]) {
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[i].length; j++) {
                let node: Node;
                if (map[i][j] === '#') {
                    node = new Node(i, j, '#')
                } else {
                    node = new PathNode(i, j, map[i][j])
                }
                this.map.set(`${i},${j}`, node)
                if (map[i][j] === 'S') {
                    this.start = node as PathNode
                }
                if (map[i][j] === 'E') {
                    this.end = node as PathNode
                }
            }
        }
        this.definePath()
    }

    definePath() {
        this.track.push(this.end)
        let length = 0
        this.end.distanceFromEnd = length
        let previous = this.setPreviousPathNode(this.end)
        
        while (previous) {
            length++
            previous.distanceFromEnd = length
            this.track.push(previous)
            previous = this.setPreviousPathNode(previous)
        }
        this.track.reverse()
    }

    setPreviousPathNode(node: PathNode): PathNode | null {
        if (node.type === 'S') {
            return null
        }

        let neighbours = this.getNeighbours(node)

        for (let i = 0; i < neighbours.length; i++) {
            let neighbour = neighbours[i]
            if (neighbour.type === '#') {
                continue
            }
            if (neighbour !== node.next && neighbour instanceof PathNode) {
                node.previous = neighbour
                neighbour.next = node
                return neighbour
            }
        }

        throw new Error('No previous path node found')
    }

    getNeighbours(node: Node): Node[] {
        let neighbours: Node[] = []
        let x = node.x
        let y = node.y
        if (this.map.has(`${x - 1},${y}`)) {
            neighbours.push(this.map.get(`${x - 1},${y}`)!)
        }
        if (this.map.has(`${x + 1},${y}`)) {
            neighbours.push(this.map.get(`${x + 1},${y}`)!)
        }
        if (this.map.has(`${x},${y - 1}`)) {
            neighbours.push(this.map.get(`${x},${y - 1}`)!)
        }
        if (this.map.has(`${x},${y + 1}`)) {
            neighbours.push(this.map.get(`${x},${y + 1}`)!)
        }
        return neighbours
    }

    getPathNeighbours(node: Node): PathNode[] {
        let neighbours = this.getNeighbours(node)
        return neighbours.filter(neighbour => neighbour instanceof PathNode) as PathNode[]
    }

    printPath() {
        let path = ''
        for (let i = 0; i < this.track.length; i++) {
            path += this.track[i].type
        }
        console.log(path)
    }

    findCheets(node: PathNode) {
        let cheets: Map<number, number> = new Map()
        let neighbours = this.getNeighbours(node)
        // console.log('- : ', node.toString())

        for (let neighbour of neighbours) {
            if (neighbour.type === '#') {
                
                let paths = this.getPathNeighbours(neighbour)

                for (let path of paths) {
                    if (path !== node && path.distanceFromEnd + 2 < node.distanceFromEnd) {
                        // if (node.distanceFromEnd - path.distanceFromEnd - 2 === 2) {
                        //     console.log('----: ', path.toString(), (cheets[node.distanceFromEnd - path.distanceFromEnd - 2] || 0) + 1)
                        // }
                        cheets.set(node.distanceFromEnd - path.distanceFromEnd - 2, (cheets[node.distanceFromEnd - path.distanceFromEnd] || 0) + 1)
                    }
                    
                }
            }
        }
        // console.log(cheets)
        return cheets
    }

    findAllCheets(length: number = 0): number {
        let cheets: Map<number, number> = new Map()
        for (let i = 0; i < this.track.length; i++) {
            let node = this.track[i]
            let cheet = this.findCheets(node)
            for (let [key, value] of cheet) {
                if (key >= length) {
                    cheets.set(key, (cheets.get(key) || 0) + value)
                }
            }
        }

        let total = 0
        for (let value of cheets.values()) {
            total += value
        }

        return total
    }

    findAllCheetsDistance(cheetDistnace: number, minimumTimeSaved: number = 0): number {
        let totalCheets = 0
        let cheets: Map<number, number> = new Map()

        for (let i = 0; i < this.track.length; i++) {
            for (let j = i + 1; j < this.track.length; j++) {
                let distance = this.track[i].distance(this.track[j])
                if (distance <= cheetDistnace) {
                    let timeSaved = this.track[i].distanceFromEnd - this.track[j].distanceFromEnd - distance
                    if (timeSaved >= minimumTimeSaved) {
                        cheets.set(timeSaved, (cheets.get(timeSaved) || 0) + 1)
                        totalCheets ++
                    }
                }
                
            }
        }
        console.log(cheets)
        return totalCheets
    }


}

class Node {
    x: number
    y: number
    type: string

    constructor(x: number, y: number, type: string) {
        this.x = x
        this.y = y
        this.type = type
    }

    toString() {
        return `${this.x},${this.y}: ${this.type}`
    }
}

class PathNode extends Node {
    distanceFromEnd: number
    previous: PathNode | null
    next: PathNode | null

    constructor(x: number, y: number, type: string) {
        super(x, y, type)
    }

    distance(node: PathNode): number {
        return Math.abs(this.x - node.x) + Math.abs(this.y - node.y)
    }
}



function part1() {
    let input = readInput();
    let data = processData(input);
    let track = new Track(data)
    let cheets = track.findAllCheets(100)
    return cheets;
}

function part2() {
    let input = readInput();
    let data = processData(input);
    let track = new Track(data)
    let cheets = track.findAllCheetsDistance(20, 100)
    return cheets;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);