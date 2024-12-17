
import { Computer } from './computer';

describe('Computer', () => {
    test('test example 1', () => {
        const computer = new Computer([2,6], {A: 0, B: 0, C: 9});
        computer.run();
        expect(computer.B).toBe(1);
    });
    test('test example 2', () => {
        const computer = new Computer([5,0,5,1,5,4], {A: 10, B: 0, C: 0});
        const output = computer.run();
        expect(output).toStrictEqual([0, 1, 2]);
    });
    test('test example 3', () => {
        const computer = new Computer([0,1,5,4,3,0], {A: 2024, B: 0, C: 0});
        const output = computer.run();
        expect(output).toStrictEqual([4,2,5,6,7,7,7,7,3,1,0]);
        expect(computer.A).toBe(0);
    });
    test('test example 4', () => {
        const computer = new Computer([1,7], {A: 0, B: 29, C: 0});
        computer.run();
        expect(computer.B).toBe(26);
    });
    test('test example 5', () => {
        const computer = new Computer([4,0], {A: 0, B: 2024, C: 43690});
        computer.run();
        expect(computer.B).toBe(44354);
    });
    test('test main example', () => {
        const computer = new Computer([0,1,5,4,3,0], {A: 729, B: 0, C: 0});
        const output = computer.run();
        expect(output).toStrictEqual([4,6,3,5,6,3,5,2,1,0]);
    });
});
