export module Helpers {
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
}

export enum BetweenComparisonType {
    inclusive,
    exclusive,
    inclusiveStart,
    inclusiveEnd
}