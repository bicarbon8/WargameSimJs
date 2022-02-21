export module Rand {
    var _id: number = 0;

    export function getInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    export function getId(): number {
        return _id++;
    }
}
