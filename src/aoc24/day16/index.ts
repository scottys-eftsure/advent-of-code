import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): Maze {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const nodeMap: Map<string, Node> = new Map();
    let start: Node | undefined;
    let end: Node | undefined;

    // Parse grid and create nodes
    for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
            const char = lines[y][x];
            if (char === 'S') {
                start = new Node(x, y, NodeType.START);
                nodeMap.set(`${x},${y}`, start);
            } else if (char === 'E') {
                end = new Node(x, y, NodeType.END);
                nodeMap.set(`${x},${y}`, end);
            } else if (char !== '#') {
                const node = new Node(x, y, NodeType.NORMAL);
                nodeMap.set(`${x},${y}`, node);
            }
        }
    }

    if (!start || !end) {
        throw new Error('Start or end not found');
    }

    return new Maze(nodeMap, start, end, lines.length, lines[0].length);

}

enum NodeType {
    START = 'S',
    END = 'E',
    NORMAL = 'N'
}

enum Direction {
    NORTH = 'N',
    EAST = 'E',
    SOUTH = 'S',
    WEST = 'W'
}

function inverseDirection(direction: Direction): Direction {
    switch (direction) {
        case Direction.NORTH: return Direction.SOUTH;
        case Direction.EAST: return Direction.WEST;
        case Direction.SOUTH: return Direction.NORTH;
        case Direction.WEST: return Direction.EAST;
    }
}

class Node {
    x: number;
    y: number;
    type: NodeType;
    distanceFromStart: Map<Direction, number> = new Map();
    neighbours: Map<Direction, Node> = new Map();

    constructor(x: number, y: number, type: NodeType) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
    
    addNeighbour(neighbour: Node, direction: Direction) {
        this.neighbours.set(direction, neighbour);
    }

    toString(): string {
        return `${this.x},${this.y}`;
    }
}

class Agent {
    position: Node;
    distanceTraveled: number; 
    facing: Direction;
    visited: Node[];

    constructor(position: Node, distanceTraveled: number = 0, facing: Direction = Direction.EAST, visited: Node[] = []) {
        this.position = position;
        this.distanceTraveled = distanceTraveled;
        this.facing = facing;
        this.position.distanceFromStart[facing] = this.distanceTraveled;
        this.visited = [...visited, this.position];
    }

    move(): Agent[] {
        const agents: Agent[] = [];
        for (let [dir, newPosition] of this.position.neighbours) {
            if (this.visited.includes(newPosition)) {
                continue;
            }
            let weight = this.calculateWeight(dir);
            let newDistance = this.distanceTraveled + weight;
            if (newDistance > newPosition.distanceFromStart[dir]) {
                continue;
            }
            let agent = new Agent(newPosition, newDistance, dir, this.visited);
            agents.push(agent);
        }

        return agents;
    }

    calculateWeight(direction: Direction): number {
        if (this.facing === direction) {
            return 1;
        } else if (this.facing === inverseDirection(direction)) {
            return 2001;
        } else {
            return 1001;
        }
    }
}

class Maze {
    start: Node;
    end: Node;
    nodeMap: Map<string, Node>;
    directions: { x: number, y: number, direction: Direction }[];
    height: number;
    width: number;

    constructor(nodeMap: Map<string, Node>, start: Node, end: Node, height: number, width: number) {
        this.nodeMap = nodeMap;
        this.start = start;
        this.end = end;
        this.height = height;
        this.width = width;
        
        // Add connections between nodes
        this.directions = [
            { x: 0, y: 1, direction: Direction.NORTH },  // down
            { x: 0, y: -1, direction: Direction.SOUTH }, // up
            { x: 1, y: 0, direction: Direction.EAST },  // right
            { x: -1, y: 0, direction: Direction.WEST }  // left
        ];

        for (const node of nodeMap.values()) {
            // console.log(node.x, node.y);
            for (const dir of this.directions) {
                const newX = node.x + dir.x;
                const newY = node.y + dir.y;
                
                // Check if neighbor exists in nodeMap
                const neighborKey = `${newX},${newY}`;
                const neighbor = nodeMap.get(neighborKey);
                
                if (neighbor) {
                    node.addNeighbour(neighbor, dir.direction);
                }
            }
        }
    }

    findShortestPath(): number {
        let queue: Agent[] = [new Agent(this.start)];

        while (queue.length > 0) {
            queue.sort((a, b) => a.distanceTraveled - b.distanceTraveled);
            
            // Remove and return agent with shortest distance
            let agent = queue.shift();
            if (!agent) {
                throw new Error('No agent found');
            }

            if (agent.position === this.end) {
                return agent.distanceTraveled;
            }
            let agents = agent.move();
            agents.forEach(agent => queue.push(agent));
        }

        throw new Error('No path found');
    }

    
    countTilesOnShortestPath(): number {
        // const queue: PriorityQueue<Agent> = new PriorityQueue((a, b) => a.distanceTraveled - b.distanceTraveled);
        // queue.enqueue(new Agent(this.start));
        let queue: Agent[] = [new Agent(this.start)];
        const shortestTiles: Set<Node> = new Set();
        let shortestPathLength: number = Infinity;

        // Use a priority queue approach like in findShortestPath()
        while (queue.length > 0) {

            queue.sort((a, b) => a.distanceTraveled - b.distanceTraveled);
            
            // Remove and return agent with shortest distance
            let agent = queue.shift();
            if (!agent) {
                throw new Error('No agent found');
            }
            // if (queue.length % 1000 === 0) {
                // console.log(queue.length, agent.distanceTraveled);
            // }

            if (agent.position === this.end) {
                shortestPathLength = agent.distanceTraveled;
                agent.visited.forEach(node => shortestTiles.add(node));
            }

            if (agent.distanceTraveled > shortestPathLength) {
                break;
            }

            agent.move().forEach(agent => queue.push(agent));
            
        }
        console.log(this.drawMaze(shortestTiles));
        return shortestTiles.size;
    }

    // draw the maze with the shortest path
    drawMaze(shortestPath: Set<Node>) {
        let maze = '';
        for (let y = 0; y < this.height; y++) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                const node = this.nodeMap.get(`${x},${y}`);
                if (node && shortestPath.has(node)) {
                    row += 'X';
                } else {
                    row += '.';
                }
            }
            maze += row + '\n';
        }
        return maze;
    }




}

function part1() {
    let input = readInput();
    let maze = processData(input);
    return maze.findShortestPath();
}

function part2() {
    let input = readInput();
    let maze = processData(input);
    return maze.countTilesOnShortestPath();
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);