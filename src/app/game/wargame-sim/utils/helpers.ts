export module Helpers {
    /**
     * performs a comparison to determine if a number, `val` is between two other numbers,
     * `start` and `end` based on a comparison `type`
     * @param val the numerical value to compare
     * @param start a numerical value indicating the start of some range of numbers
     * @param end a numerical value indicating the end of some range of numbers
     * @param type the type of comparison to perform
     * @returns true if `val` is between the `start` and `end` based on the `type` of comparison
     */
    export function isBetween(val: number, start: number, end: number, type: BetweenComparisonType = BetweenComparisonType.inclusiveStart): boolean {
        switch(type) {
            case BetweenComparisonType.inclusiveStart:
                return (val >= start && val < end);
            case BetweenComparisonType.inclusiveEnd:
                return (val > start && val <= end);
            case BetweenComparisonType.inclusive:
                return (val >= start && val <= end);
            case BetweenComparisonType.exclusive:
                return (val > start && val < end);
            default:
                return false;
        }
    }

    /**
     * returns the highest value from a passed in array of numbers or 0 if no
     * values passed in
     * @param values an array of numbers
     * @returns the highest value from the array or 0 if no values passed in
     */
    export function getHighest(values: number[]): number {
        let highest: number = 0;
        if (values) {
            for (var i=0; i<values.length; i++) {
                if (values[i] > highest) {
                    highest = values[i];
                }
            }
        }
        return highest
    }

    /**
     * returns the lowest value from a passed in array of numbers or Infinity if no
     * values passed in
     * @param values an array of numbers
     * @returns the lowest value from the array or Infinity if no values passed in
     */
    export function getLowest(values: number[]): number {
        let lowest: number = Infinity;
        if (values) {
            for (var i=0; i<values.length; i++) {
                if (values[i] < lowest) {
                    lowest = values[i];
                }
            }
        }
        return lowest
    }

    export function hitAreaCallback(hitArea: Phaser.Geom.Rectangle, x: number, y: number, go: Phaser.GameObjects.GameObject): boolean {
        const halfWidth: number = hitArea.width / 2;
        const halfHeight: number = hitArea.height / 2;
        if (isBetween(x, halfWidth, halfWidth + hitArea.width)
            && isBetween(y, halfHeight, halfHeight + hitArea.height)) {
            // console.info(`x: ${x.toFixed(0)}, y: ${y.toFixed(0)}`);
            return true;
        }
        return false;
    }
}

export enum BetweenComparisonType {
    inclusive,
    exclusive,
    inclusiveStart,
    inclusiveEnd
}