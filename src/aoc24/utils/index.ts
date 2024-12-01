import * as fs from 'fs';
import * as path from 'path';

export const readInputFile = (filePath: string): string => {
    const fullPath = path.resolve(__dirname, filePath);
    return fs.readFileSync(fullPath, 'utf-8');
};

export const parseInput = (input: string): string[] => {
    return input.trim().split('\n');
};