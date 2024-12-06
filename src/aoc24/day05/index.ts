import { readFileSync } from 'fs';
import { join } from 'path';

type PageOrder = [number, number];

interface ProcessedData {
    pageOrders: PageOrder[];
    pageUpdates: number[][];
}

export function readInput(): string {
    const inputPath = join(__dirname, 'input.txt');
    return readFileSync(inputPath, 'utf-8');
}

export function processData(data: string): ProcessedData {
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    // Find the dividing point between sections
    const updateStartIndex = lines.findIndex(line => line.includes(','));
    
    // Parse page orders
    const pageOrders = lines.slice(0, updateStartIndex)
        .map(line => line.split('|').map(Number) as PageOrder);
    
    // Parse page updates
    const pageUpdates = lines.slice(updateStartIndex)
        .map(line => line.split(',').map(Number));

    return { pageOrders, pageUpdates };
}

class Manual {
    readonly pages: { [key: number]: Page } = {};
    constructor(pageOrders: PageOrder[]) {
        this.buildManual(pageOrders);
    }

    addPage(page: Page): void {
        this.pages[page.num] = page;
    }

    getPage(num: number): Page {
        let page = this.pages[num];
        if (!page) {
            let newPage = new Page(num)
            this.addPage(newPage);
            return newPage;
        }
        return page;
    }

    getPages(nums: number[]): Page[] {
        let pages = [];
        for (let num of nums) {
            pages.push(this.getPage(num));
        }
        return pages;
    }

    buildManual(pageOrders: PageOrder[]) {
        for (let [before, after] of pageOrders) {
            let beforePage = this.getPage(before);
            let afterPage = this.getPage(after);
            beforePage.addPageAfter(afterPage);
            afterPage.addPageBefore(beforePage);
        }
    }

    toString(): string {
        return `Manual(\n    ${Object.values(this.pages).map(page => page.toString()).join('\n ')}\n    pages)`;
    }

    checkOrder(pages: Page[]): boolean {
        
        for (let i = 0; i < pages.length; i++) {
            let page = pages[i];
            for (let afterPage of pages.slice(i + 1)) {
                if (!page.isAfter(afterPage)) {
                    return false;
                }
            }
        }
        return true;

    }

    // getFirstPage(pages: Page[]): Page {
    //     let firstPage = pages[0];
    //     return firstPage;
    // }

    // orderPages(pages: Page[]): Page[] {
    //     let orderedPages = [];
    //     let page = pages[0];
    //     orderedPages.push(page);
    //     while (page.pagesAfter.length > 0) {
    //         page = page.pagesAfter[0];
    //         orderedPages.push(page);
    //     }
    //     return orderedPages;
    // }

    
    orderPages(pages: Page[]): Page[] {
        let orderedPages = pages.sort((a, b) => a.isAfter(b) ? 1 : -1);
        return orderedPages
    }
}

class Page {
    readonly num: number;
    readonly pagesBefore: Page[] = [];
    readonly pagesAfter: Page[] = [];
    constructor(num: number) { 
        this.num = num;
    }

    addPageBefore(page: Page) {
        this.pagesBefore.push(page);
    }

    addPageAfter(page: Page) {
        this.pagesAfter.push(page);
    }

    toString(): string {
        return `Page(num: ${this.num}, pagesBefore: ${this.pagesBefore.length}, pagesAfter: ${this.pagesAfter.length})`;
    }

    isAfter(page: Page): boolean {
        return this.pagesAfter.includes(page);
    }

    isBefore(page: Page): boolean {
        return this.pagesBefore.includes(page);
    }
}





function part1() {
    let input = readInput();
    let data = processData(input);
    let manual = new Manual(data.pageOrders);
    let check = 0;
    for (let orders of data.pageUpdates) {
        let pages = manual.getPages(orders);

        let isInOrder = manual.checkOrder(pages)
        if (isInOrder) {
            let middlePage = pages[Math.floor(pages.length / 2)];
            check += middlePage.num;
        }
    }
    return check;
}

function part2() {
    let input = readInput();
    let data = processData(input);
    let manual = new Manual(data.pageOrders);
    let check = 0;
    for (let orders of data.pageUpdates) {
        let pages = manual.getPages(orders);

        let isInOrder = manual.checkOrder(pages)
        if (!isInOrder) {

            let orderedPages = manual.orderPages(pages);

            let middlePage = orderedPages[Math.floor(pages.length / 2)];
            check += middlePage.num;
        }
    }
    return check;
    return 0;
}

console.log(`Part 1 Answer: ${part1()}`);
console.log(`Part 2 Answer: ${part2()}`);