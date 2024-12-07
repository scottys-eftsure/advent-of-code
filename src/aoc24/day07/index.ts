import { readFileSync } from 'fs';
import { join } from 'path';

interface InputData {
    result: bigint;
    inputs: bigint[];
}

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): InputData[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
        const [result, inputPart] = line.split(':').map(part => part.trim());
        return {
            result: BigInt(parseInt(result)),
            inputs: inputPart.split(' ').map(num => BigInt(parseInt(num)))
        };
    });
}

function makeEquasions(data: InputData[]): Equasion[] {
    let equasions: Equasion[] = [];
    for (let equasionData of data) {
        equasions.push(new Equasion(equasionData));
    }
    return equasions;
}

enum Operator {
    add = '+',
    mul = '*'
}

class FormulaBuilder {
    forumla: string;
    operators: Operator[] = [];


    constructor(val: bigint) {
        this.forumla = `${val}`;
    }

    copy (): FormulaBuilder {
        let fb = new FormulaBuilder(BigInt(0));
        fb.forumla = this.forumla;
        fb.operators = [...this.operators];
        return fb;
    }

    append(val: string, op: Operator): FormulaBuilder {
        this.forumla + ` ${op} ${val} `;
        this.operators.push(op);
        return this;
    }

    toString(): string {
        return `F(${this.forumla})`;
    }
}


class Equasion {

    result: bigint;
    inputs: bigint[];

    constructor(inputData: InputData) {
        this.result = inputData.result;
        this.inputs = inputData.inputs;
    }

    toString(): string {
        return `Equasion(result: ${this.result}, inputs: ${this.inputs})`;
    }

    add(a: bigint, b: bigint): bigint {
        return a + b;
    }

    multiply(a: bigint, b: bigint): bigint {
        return a * b;
    }

    concat (a: bigint, b: bigint): bigint {
        return BigInt(`${a}${b}`);
    }


    isPossiblyValid(currentInputs?: bigint[], f?: string): boolean {
        if (!currentInputs) {
            currentInputs = this.inputs;
        }

        if (!f) {
            f = `${currentInputs[0]}`;
        }
        // console.log(`starting - isPossiblyValid for ${this.toString()} for ${currentInputs}`);

        if (currentInputs.length > 2) {
            let addResult = this.add(currentInputs[0], currentInputs[1]);

            if (addResult > this.result ) {
                // console.log(`invalid - f: ${f} + ${currentInputs[1]} = ${addResult}`);
                // return false;
                
            } else {
                if (this.isPossiblyValid([addResult, ...currentInputs.slice(2)], f + ` + ${currentInputs[1]}`)) {
                    // console.log(`solving - isPossiblyValid for ${this.toString()} for add ${currentInputs}`);
                    return true;
                }
            }

            // 2941973819040
            // 2941973819040

            let mulResult = this.multiply(currentInputs[0], currentInputs[1]);

            if (mulResult > this.result ) {
                // console.log(`invalid - f: ${f} * ${currentInputs[1]} = ${mulResult}`);
                // return false;
            } else {
                if (this.isPossiblyValid([mulResult, ...currentInputs.slice(2)], f + ` * ${currentInputs[1]}`)) {
                    // console.log(`solving - isPossiblyValid for ${this.toString()} for mul ${currentInputs}`);
                    return true;

                }
            }

            let concatResult = this.concat(currentInputs[0], currentInputs[1]);

            if (concatResult > this.result ) {
                // console.log(`invalid - f: ${f} || ${currentInputs[1]} = ${mulResult}`);
                // return false;
            } else {
                if (this.isPossiblyValid([concatResult, ...currentInputs.slice(2)], f + ` || ${currentInputs[1]}`)) {
                    // console.log(`solving - isPossiblyValid for ${this.toString()} for concat ${currentInputs}`);
                    return true;

                }
            }
            // console.log(`invalid - isPossiblyValid for ${this.toString()} for ${f}`);
            return false

        } else if (currentInputs.length === 2) {
            let addResult = this.add(currentInputs[0], currentInputs[1]);
            // console.log(`checking - f: ${f} + ${currentInputs[1]} = ${addResult}`);
            if (addResult === this.result) {
                // console.log(`valid - isPossiblyValid for ${this.toString()} for add ${currentInputs} - term`);
                return true;
            }
            let mulResult = this.multiply(currentInputs[0], currentInputs[1]);
            // console.log(`checking - f: ${f} * ${currentInputs[1]} = ${mulResult}`);
            if (mulResult === this.result) {
                // console.log(`valid - isPossiblyValid for ${this.toString()} for mul ${currentInputs} - term`);
                return true;
            }
            
            let concatResult = this.concat(currentInputs[0], currentInputs[1]);
            // console.log(`checking - f: ${f} || ${currentInputs[1]} = ${mulResult}`);
            if (concatResult === this.result) {
                // console.log(`valid - isPossiblyValid for ${this.toString()} for concat ${currentInputs} - term`);
                return true;
            }
            // console.log(`invalid - isPossiblyValid for ${this.toString()} for ${f} - term`);
            return false;

        } else {
            throw new Error("Invalid length of inputs");
        }




    }
}

function part1() {
    let input = readInput();
    let data = processData(input);
    let equasions = makeEquasions(data);
    let count = BigInt(0);
    console.log(equasions)
    for (let equasion of equasions) {
        console.log(`start - equastion ${equasion}`);
        if (equasion.isPossiblyValid()) {
            count += equasion.result;
            
            console.log(`valid final - equasion ${equasion}`);
        }
        console.log(`end - equasion ${equasion}`);
    }
    return count;
}

function part2() {
    let input = readInput();
    let data = processData(input);
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);