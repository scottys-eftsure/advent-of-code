import { readFileSync } from 'fs';
import { join } from 'path';

interface Card {
    id: number;
    winningNumbers: number[];
    yourNumbers: number[];
    copies: number;
}



export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): Card[] {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    return lines.map(line => {
        // Split into card info and numbers
        const [cardPart, numbersPart] = line.split(':');
        
        // Extract card ID
        const cardId = parseInt(cardPart.replace('Card', '').trim());
        
        // Split numbers into winning and your numbers
        const [winningPart, yourPart] = numbersPart.split('|');
        
        // Parse number strings into arrays of numbers
        const winningNumbers = winningPart.trim()
            .split(/\s+/)
            .map(num => parseInt(num.trim()));
            
        const yourNumbers = yourPart.trim()
            .split(/\s+/)
            .map(num => parseInt(num.trim()));
            
        return {
            id: cardId,
            winningNumbers,
            yourNumbers,
            copies: 1,
        };
    });
}



export function getMatches (winningNumbers: number[], yourNumbers: number[]): number {
    return winningNumbers.reduce((score = 0, num) => {
        // score = 0;
        if (yourNumbers.includes(num)) {
            if (score === 0) {
                return 1;
            } else {
                return score * 2;
            }
        }
        return score;
    }, 0);
}

export function getMatches2 (winningNumbers: number[], yourNumbers: number[]): number {
    return winningNumbers.reduce((score, num) => {
        if (yourNumbers.includes(num)) {
            return score += 1;
        }
        return score;
    }, 0);
}


export function main() {
    const input = readInput();
    const cards = processData(input);
    let score = 0;
    for (let card of cards) {
        let matches = getMatches(card.winningNumbers, card.yourNumbers);
        score += matches;
    }
    return score;
}


export function part2() {
    const input = readInput();
    const cards = processData(input);
    let score = 0;
    for (let card of cards) {
        let matches = getMatches2(card.winningNumbers, card.yourNumbers);
        // console.log(matches);
        for (let i = card.id; i < card.id + matches; i++) {
            // console.log(i);
            // console.log(`id: ${cards[i].id}`)

            cards[i].copies += card.copies;

        }
        score += card.copies;
    }
    // console.log(cards);
    return score;
}

// main();
console.log(part2());

