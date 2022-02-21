import { DiceManager } from '../utils/dice-manager';
import { WoundChart, woundChart } from './wound-chart';

describe('WoundChart', () => {
  let data = [
    {str: 0, def: 0, expected: false},
    {str: 0, def: 10, expected: false},
    {str: 1, def: 9, expected: false},
    {str: 1, def: 0, expected: true},
    {str: 10, def: 0, expected: true}
  ];
  data.forEach((d) => {
    it(`certain values always return a specific result: ${JSON.stringify(d)}`, () => {
      expect(woundChart.doesWound(d.str, d.def)).toEqual(d.expected);
    });
  });

  let fullData = [
    {str: 1, def: 8, diceRolls: [6, 6], expected: true},
    {str: 1, def: 8, diceRolls: [5, 6], expected: false},
    {str: 1, def: 8, diceRolls: [6, 5], expected: false},
    {str: 1, def: 7, diceRolls: [6, 6], expected: true},
    {str: 1, def: 7, diceRolls: [6, 5], expected: true},
    {str: 1, def: 7, diceRolls: [6, 4], expected: false},
    {str: 1, def: 7, diceRolls: [4, 6], expected: false},
    {str: 1, def: 6, diceRolls: [6, 6], expected: true},
    {str: 1, def: 6, diceRolls: [6, 5], expected: true},
    {str: 1, def: 6, diceRolls: [6, 4], expected: true},
    {str: 1, def: 6, diceRolls: [6, 3], expected: false},
    {str: 1, def: 6, diceRolls: [3, 6], expected: false},
    {str: 1, def: 6, diceRolls: [5, 5], expected: false},
    {str: 1, def: 5, diceRolls: [6], expected: true},
    {str: 1, def: 5, diceRolls: [5], expected: false},
    {str: 1, def: 4, diceRolls: [6], expected: true},
    {str: 1, def: 4, diceRolls: [5], expected: false},
    {str: 1, def: 3, diceRolls: [5], expected: true},
    {str: 1, def: 3, diceRolls: [4], expected: false},
    {str: 1, def: 2, diceRolls: [5], expected: true},
    {str: 1, def: 2, diceRolls: [4], expected: false},
    {str: 1, def: 1, diceRolls: [4], expected: true},
    {str: 1, def: 1, diceRolls: [3], expected: false},
    {str: 2, def: 1, diceRolls: [4], expected: true},
    {str: 2, def: 1, diceRolls: [3], expected: false},
    {str: 3, def: 1, diceRolls: [3], expected: true},
    {str: 3, def: 1, diceRolls: [2], expected: false},
    {str: 10, def: 1, diceRolls: [3], expected: true},
    {str: 10, def: 1, diceRolls: [2], expected: false}
  ];
  fullData.forEach((d) => {
    it(`can determine wounds based on strength and defence: ${JSON.stringify(d)}`, () => {
      let dice: DiceManager = new DiceManager();
      spyOn(dice, 'roll').and.returnValues(...d.diceRolls);
      let wounds: WoundChart = new WoundChart(dice);
      expect(wounds.doesWound(d.str, d.def)).toEqual(d.expected);
      expect(dice.roll).toHaveBeenCalled();
    });
  });
});
