import { readFileSync } from 'fs';
import { join } from 'path';

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): any {
    // Implement the logic to process the data for Day 2 challenge
    const lines = data.split('\n').filter(line => line.trim() !== '');
    // Process lines and return results
    return lines; // Placeholder return
}

// Additional functions for Day 2 challenge can be added here