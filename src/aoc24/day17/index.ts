import { readFileSync } from 'fs';
import { join } from 'path';
import { Computer } from './computer';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): { registers: { [key: string]: number }, program: number[] } {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const registers: { [key: string]: number } = {};
    let program: number[] = [];

    lines.forEach(line => {
        if (line.startsWith('Register')) {
            const [register, value] = line.split(':').map(part => part.trim());
            registers[register.split(' ')[1]] = parseInt(value, 10);
        } else if (line.startsWith('Program')) {
            program = line.split(':')[1].split(',').map(num => parseInt(num.trim(), 10));
        }
    });

    return { registers, program };
}


function part1() {
    let input = readInput();
    let data = processData(input);
    let computer = new Computer(data.program, data.registers);
    let output = computer.run();

    return output.toString();
}

function part2() {
    let input = readInput();
    let data = processData(input);
    console.log(data.program)
    let output: number[] = [];
    let i = 1000000000 
    let total = 10000000000
    for (i; i < total; i++) {
        data.registers['A'] = i;

        let computer = new Computer(data.program, data.registers);
        output = computer.run();
        if (output.toString() == data.program.toString()) {
            console.log('Found it!');
            break;
        } 

        if (i % (total / 100) === 0) {
            console.log(i);
        }
    }
    console.log(output);
    return i;
}

// console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);