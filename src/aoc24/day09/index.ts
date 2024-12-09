import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'test.input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): number[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines[0].split('').map(Number);
}

class DiskMap {
    files: File[] = [];
    size: number;
    startBlock: Block;
    endBlock: Block;
    blockWithNextGap: Block;


    constructor(data: number[]) {
        let startingPosition = 0;
        let nextId = 0;
        for (let i = 0; i < data.length; i++) {
            if (i % 2 === 0) {
                let file = new File(nextId, data[i], startingPosition); 
                this.files.push(file);
                nextId++;
            }
            startingPosition += data[i];
        }
        this.size = startingPosition;

        this.startBlock = this.files[0].blocks[0];
        this.endBlock = this.files[this.files.length - 1].blocks[this.files[this.files.length - 1].blocks.length - 1];

        let prevBlock: Block = this.files[0].blocks[this.files[0].blocks.length - 1];
        this.blockWithNextGap = prevBlock;
        for (let file of this.files.slice(1)) {
            prevBlock.addNextBlock(file.blocks[0]);                
            prevBlock = file.blocks[file.blocks.length - 1];
        }
    }

    toString(): string {
        return `DiskMap(size: ${this.size}, files: ${this.files.length}, startBlock: ${this.startBlock}, endBlock: ${this.endBlock})`;
    }

    fillNextGap(): void {
        let blockForGap = this.endBlock;
        let newEndBlock = this.endBlock.previousBlock;

        blockForGap.moveBlockAfter(this.blockWithNextGap, this.blockWithNextGap.position + 1);
        if (newEndBlock === undefined) {
            throw new Error('Tried to move the first block to the end');
        }
        this.endBlock = newEndBlock;

        // check next gap
        this.blockWithNextGap = this.findNextGapFrom(blockForGap);
    }

    findNextGapFrom(block: Block): Block {
        let curBlock = block;
        while (curBlock.nextBlock !== undefined) {
            if (curBlock.nextBlock.position !== curBlock.position + 1) {
                return curBlock;
            }
            curBlock = curBlock.nextBlock;
        }
        return curBlock;
    }

    printBlocks(): void {    
        let block: Block | undefined = this.startBlock;
        while (block !== undefined) {
            console.log(block.toString());
            block = block.nextBlock;
        }
    }

    fillAllGaps(): void {
        while(this.blockWithNextGap !== this.endBlock) {
            this.fillNextGap();
        }
    }

    calculateChecksum(): number {
        let checksum = 0;
        let block: Block | undefined = this.startBlock;
        while (block !== undefined) {
            checksum += block.position * block.file.id;
            block = block.nextBlock;
        }
        return checksum;
    }
}


class File {
    blocks: Block[] = [];
    id: number;

    constructor(id: number, size: number, startingPosition: number) {
        this.id = id;
        for (let i = 0; i < size; i++) {
            let block = new Block(id, startingPosition + i, this);
            if (this.blocks.length > 0) {
                this.blocks[this.blocks.length - 1].addNextBlock(block);
            }
            this.blocks.push(block);
        }
    }

    toString(): string {
        return `File(id: ${this.id}, blocks: ${this.blocks.length})`;
    }

    fileStrRep(): string {
        return `${this.id}`.repeat(this.blocks.length);
    }
}

class Block {
    id: number;
    position: number;
    file: File;
    previousBlock: Block | undefined;
    nextBlock: Block | undefined;

    constructor(id: number, position: number, file: File) {
        this.id = id;
        this.position = position;
        this.file = file;
    }

    toString(): string {
        return `Block(id: ${this.id}, position: ${this.position}, previousBlockPos: ${this.previousBlock?.position}, nextBlockPos: ${this.nextBlock?.position})`;
    }

    addNextBlock(block: Block | undefined): void {
        this.nextBlock = block;
        if (block) {
            block.previousBlock = this;
        }
    }

    addPreviousBlock(block: Block | undefined): void {
        this.previousBlock = block;
        if (block) {
            block.nextBlock = this;
        }
    }

    moveBlockAfter(block: Block, position: number): void {
        this.previousBlock?.addNextBlock(this.nextBlock);
        this.nextBlock?.addPreviousBlock(this.previousBlock); // both encase of first or last block

        this.addNextBlock(block.nextBlock)
        block.addNextBlock(this);

        this.position = position;
    }

    moveBlockBefore(block: Block, position: number): void {
        this.previousBlock?.addNextBlock(this.nextBlock);
        this.nextBlock?.addPreviousBlock(this.previousBlock); // both encase of first or last block

        this.addPreviousBlock(block.previousBlock)
        block.addPreviousBlock(this);

        this.position = position;
    }
}


function part1() {
    let input = readInput();
    let data = processData(input);
    let diskMap = new DiskMap(data);
    // diskMap.printBlocks();

    diskMap.fillAllGaps();
    
    // diskMap.printBlocks();
    return diskMap.calculateChecksum();
}

function part2() {
    let input = readInput();
    let data = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);