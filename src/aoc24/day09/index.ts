import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): number[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines[0].split('').map(Number);
}

class DiskMap {
    files: File[] = [];
    fileMap: Map<number, File> = new Map();
    size: number;
    startBlock: Block;
    endBlock: Block;
    blockWithNextGap: Block;
    startFile: File;
    endFile: File;


    constructor(data: number[]) {
        let startingPosition = 0;
        let nextId = 0;
        for (let i = 0; i < data.length; i++) {
            if (i % 2 === 0) {
                let file = new File(nextId, data[i], startingPosition); 
                this.files.push(file);
                this.fileMap.set(nextId, file);
                nextId++;
            }
            startingPosition += data[i];
        }
        this.size = startingPosition;

        this.startBlock = this.files[0].blocks[0];
        this.endBlock = this.files[this.files.length - 1].blocks[this.files[this.files.length - 1].blocks.length - 1];

        this.startFile = this.files[0];
        this.endFile = this.files[this.files.length - 1];

        let prevBlock: Block = this.files[0].blocks[this.files[0].blocks.length - 1];
        this.blockWithNextGap = prevBlock;

        let prevFile: File = this.startFile;

        for (let file of this.files.slice(1)) {
            prevBlock.addNextBlock(file.blocks[0]);                
            prevBlock = file.blocks[file.blocks.length - 1];

            prevFile.addNextFile(file);
            prevFile = file;
        }
    }

    toString(): string {
        return `DiskMap(size: ${this.size}, files: ${this.files.length}, startBlock: ${this.startBlock}, endBlock: ${this.endBlock})`;
    }

    fillNextBlockGap(): void {
        let blockForGap = this.endBlock;
        let newEndBlock = this.endBlock.previousBlock;

        blockForGap.moveBlockAfter(this.blockWithNextGap, this.blockWithNextGap.position + 1);
        if (newEndBlock === undefined) {
            throw new Error('Tried to move the first block to the end');
        }
        this.endBlock = newEndBlock;

        // check next gap
        this.blockWithNextGap = this.findNextGapFromBlock(blockForGap);
    }

    findNextGapFromBlock(block: Block): Block {
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

    printFiles(): void {    
        let file: File | undefined = this.startFile;
        while (file !== undefined) {
            console.log(file.toString());
            file = file.nextFile;
        }
    }

    fillAllBlockGaps(): void {
        while(this.blockWithNextGap !== this.endBlock) {
            this.fillNextBlockGap();
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

    fillNextFileGap(fileToMove: File): void {
        let file = this.startFile;

        while (file !== fileToMove) {
            // console.log(`Trying to move file ${fileToMove.id} after file ${file.id}`);
            if (file.getFollowingGapSize() >= fileToMove.size) {
                fileToMove.moveFileAfter(file, file.position + file.size);
                return;
            }
            if (file.nextFile === undefined) {
                throw new Error('No following file');
            }
            file = file.nextFile;
        }
    }

    fillAllFileGaps(): void {
        for (let file of this.files.reverse()) {
            this.fillNextFileGap(file);
        }
    }

    
    calculateFileChecksum(): number {
        let checksum = 0;
        let file: File | undefined = this.startFile;
        while (file !== undefined) {
            checksum += file.calculateChecksum();
            file = file.nextFile;
        }
        return checksum;
    }
}


class File {
    blocks: Block[] = [];
    id: number;
    position: number;
    size: number;
    nextFile: File | undefined;
    previousFile: File | undefined;

    constructor(id: number, size: number, startingPosition: number) {
        this.id = id;
        this.size = size;
        this.position = startingPosition;
        for (let i = 0; i < size; i++) {
            let block = new Block(id, startingPosition + i, this);
            if (this.blocks.length > 0) {
                this.blocks[this.blocks.length - 1].addNextBlock(block);
            }
            this.blocks.push(block);
        }
    }

    toString(): string {
        return `File(id: ${this.id}, blocks: ${this.blocks.length}, position: ${this.position}, size: ${this.size})`;
    }

    fileStrRep(): string {
        return `${this.id}`.repeat(this.blocks.length);
    }

    addNextFile(file: File | undefined): void {
        this.nextFile = file;
        if (file) {
            file.previousFile = this;
        }
    }

    addPreviousFile(file: File | undefined): void {
        this.previousFile = file;
        if (file) {
            file.nextFile = this;
        }
    }

    moveFileAfter(file: File, position: number): void {
        if (file.getFollowingGapSize() < this.size) {
            throw new Error('Not enough space after file');
        } else {
            // console.log(`Moving file ${this.id} with size ${this.size} after file ${file.id} into gap of size ${file.getFollowingGapSize()}`);
        }
        this.previousFile?.addNextFile(this.nextFile);
        this.nextFile?.addPreviousFile(this.previousFile); // both in case of first or last file

        this.addNextFile(file.nextFile);
        file.addNextFile(this);

        this.position = position;

        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i].position = position + i;
        }

        // file.blocks[file.blocks.length - 1].nextBlock?.moveBlockAfter(this.blocks[this.blocks.length - 1], position + this.size);
        // this.blocks[0].moveBlockAfter(file.blocks[file.blocks.length - 1], position);
    }

    // moveFileBefore(file: File, position: number): void {
    //     this.previousFile?.addNextFile(this.nextFile);
    //     this.nextFile?.addPreviousFile(this.previousFile); // both in case of first or last file

    //     this.addPreviousFile(file.previousFile);
    //     file.addPreviousFile(this);

    //     this.position = position;
    // }

    getFollowingGapSize(): number {
        // console.log(`getFollowingGapSize (${this.toString()}): ${this.nextFile?.position} - ${this.position} - ${this.size}`);
        if (this.nextFile) {
            return this.nextFile.position - this.position - this.size;
        }
        throw new Error('No following file');
        // return 0;

    }

    calculateChecksum(): number {
        let checksum = 0;
        for (let i = 0; i < this.blocks.length; i++) {
            checksum += (this.position + i) * this.id;
        }
        return checksum;
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

}


function part1() {
    let input = readInput();
    let data = processData(input);
    let diskMap = new DiskMap(data);
    // diskMap.printBlocks();

    diskMap.fillAllBlockGaps();
    
    // diskMap.printBlocks();
    return diskMap.calculateChecksum();
}

function part2() {
    let input = readInput();
    let data = processData(input);
    let diskMap = new DiskMap(data);
    // diskMap.printFiles();

    diskMap.fillAllFileGaps();
    
    // diskMap.printFiles();
    return diskMap.calculateChecksum();
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);