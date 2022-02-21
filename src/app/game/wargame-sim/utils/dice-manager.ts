import { DiceRollDetails } from "./dice-roll-details";
import { Rand } from "./rand";

export module DiceManager {
    /**
     * simulates rolling a specified number of dice
     * @param numberAndSides a string like `1x6` or `2x6` where the first number is the number of dice
     * and the second number is the number of sides per dice
     * @returns an array of dice roll results based on the requested number of rolls
     */
    export function rollStr(numberAndSides: string = '1x6'): number[] {
        let parsed: DiceRollDetails = this.parse(numberAndSides);
        return this.rollMultiple(parsed.dice, parsed.sides);
    }

    export function rollMultiple(dice: number = 1, sides: number = 6): number[] {
        var results: number[] = [];
        for (var i=0; i<dice; i++) {
            results.push(this.roll(sides));
        }
        return results;
    }

    export function roll(sides: number = 6): number {
        return Rand.getInt(1, sides);
    }

    export function parse(numberAndSides: string): DiceRollDetails {
        let details: DiceRollDetails = {dice: 1, sides: 6};
        if (numberAndSides) {
            let numberAndSidesSplit: string[] = numberAndSides.split('x');
            if (numberAndSidesSplit && numberAndSidesSplit.length == 2) {
                let dice: number = +numberAndSidesSplit[0];
                let sides: number = +numberAndSidesSplit[1];
                details.dice = dice;
                details.sides = sides;
            }
        }
        return details;
    }
}