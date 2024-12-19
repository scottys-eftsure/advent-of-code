
export class Computer {
    program: number[];
    A: number;
    B: number;
    C: number;
    private pointer: number = 0;
    private bits: number = 8;
    private defaultStep: number = 2;

    constructor(program: number[], registers: { [key: string]: number }) {
        this.program = program;
        this.A = registers['A'];
        this.B = registers['B'];
        this.C = registers['C'];
    }

    toString() {
        return `Computer([${this.program}] A=${this.A}, B=${this.B}, C=${this.C}, Pointer=${this.pointer})`;
    }

    get halted(): boolean {
        return this.pointer >= this.program.length;
    }

    run(): number[] {
        let output: number[] = [];
        while (!this.halted) {
            let value = this.step();
            // console.log(this.toString());
            if (value !== undefined) {
                if (output.length <= this.program.length && value !== this.program[output.length]) {
                    return [];
                }
                output.push(value);
            }
        }
        // console.log('Computer is halted');
        return output;
    }

    step(): number | void {

        const opcode = this.program[this.pointer];
        const operand = this.program[this.pointer + 1];

        switch (opcode) {
            case 0:
                return this.adv(operand);
            case 1:
                return this.bxl(operand);
            case 2:
                return this.bst(operand);
            case 3:
                return this.jnz(operand);
            case 4:
                return this.bxc(operand);
            case 5:
                return this.out(operand);
            case 6:
                return this.bdv(operand);// uncov start
            case 7:
                return this.cdv(operand);
            default:
                throw new Error(`Invalid opcode: ${opcode}`); // uncon end
        } 
    }

    private getComboOperand(operand: number): number {
        switch (operand) {
            case 0:
            case 1:
            case 2:
            case 3:
                return operand;
            case 4:
                return this.A;
            case 5:
                return this.B; // uncov
            case 6:
                return this.C;
            case 7:
                throw new Error('Operand 7 is reserved'); // uncov start
            default:
                throw new Error(`Invalid operand: ${operand}`);; // uncov end
        }
    }

    private adv(instruction: number): void {
        let result = this.A / 2 ** (this.getComboOperand(instruction));
        this.A = Math.floor(result);
        this.pointer += this.defaultStep;
    }

    private bxl(instruction: number): void {
        let result = this.B ^ instruction;
        this.B = result;
        this.pointer += this.defaultStep;
    }

    private bst(instruction: number): void {
        let result = this.getComboOperand(instruction) % this.bits;
        this.B = result;
        this.pointer += this.defaultStep;
    }

    private jnz(instruction: number): void {
        if (this.A !== 0) {
            this.pointer = instruction;
        } else {
            this.pointer += this.defaultStep;
        }
    }

    private bxc(instruction: number): void {
        if (instruction) {}; // Do nothing
        let result = this.B ^ this.C;
        this.B = result;
        this.pointer += this.defaultStep;
    }

    private out(instruction: number): number {
        let value = this.getComboOperand(instruction) % 8;
        this.pointer += this.defaultStep;
        return value;
    }

    private bdv(instruction: number): void {
        let result = this.A / (2 ** this.getComboOperand(instruction)); // uncov start
        this.B = Math.floor(result);
        this.pointer += this.defaultStep;
    }

    private cdv(instruction: number): void {
        let result = this.A / (2 ** this.getComboOperand(instruction));
        this.C = Math.floor(result);
        this.pointer += this.defaultStep; // uncov end
    }
}