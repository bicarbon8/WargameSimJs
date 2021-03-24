import { Dice } from './dice';

describe('Dice', () => {
  it('should be possible to get all numbers between 1 and 6 inclusive', () => {
    let numbers: any = {};
    while (numbers["1"] !== 1 || numbers["2"] !== 2 || numbers["3"] !== 3
      || numbers["4"] !== 4 || numbers["5"] !== 5 || numbers["6"] !== 6) {
      let result: number = Dice.roll(1, 6)[0];
      numbers[result.toString()] = result;
    }
    expect(numbers["1"] === 1 && numbers["2"] === 2 && numbers["3"] === 3
      && numbers["4"] === 4 && numbers["5"] === 5 && numbers["6"] === 6).toBeTrue();
  });
});
