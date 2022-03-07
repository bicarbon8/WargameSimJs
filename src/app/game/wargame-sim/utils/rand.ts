import { WeightedValue } from "./weighted-value";

export module Rand {
    var _id: number = 0;

    export function getInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function getId(): number {
        return _id++;
    }

    export function guid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Pass in an object like [{index:1, weight:10}, {index:4, weight:4}, {index:9, weight:400}] and it'll return either 1, 4 or 9, factoring in their respective
    // weight. So in this example, 9 is likely to be returned 400 times out of 414
    export function getRandomWeightedValue(options: WeightedValue[]): WeightedValue {
        const totalSum = options.reduce((acc, item) => acc + item.weight, 0);

        let runningTotal = 0;
        const cumulativeValues = options.map((wv: WeightedValue, index: number) => {
            const relativeValue = wv.weight/totalSum;
            const cv = {
                key: wv,
                value: relativeValue + runningTotal
            };
            runningTotal += relativeValue;
            return cv;
        });

        const r = Math.random();
        return cumulativeValues.find(({ key, value }) => r <= value)!.key;
    };
}
