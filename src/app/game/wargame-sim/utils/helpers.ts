import { LayoutContent } from 'phaser-ui-components';
import { XY } from '../ui/types/xy';

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
    export function getHighest(...values: number[]): number {
        let highest: number = -Infinity;
        if (values) {
            for (var i=0; i<values.length; i++) {
                if (values[i] > highest) {
                    highest = values[i];
                }
            }
        }
        return highest;
    }

    /**
     * returns the lowest value from a passed in array of numbers or Infinity if no
     * values passed in
     * @param values an array of numbers
     * @returns the lowest value from the array or Infinity if no values passed in
     */
    export function getLowest(...values: number[]): number {
        let lowest: number = Infinity;
        if (values) {
            for (var i=0; i<values.length; i++) {
                if (values[i] < lowest) {
                    lowest = values[i];
                }
            }
        }
        return lowest;
    }

    export function displayDebug(scene: Phaser.Scene, object: LayoutContent, name?: string): void {
        const content: any = object;
        const debugText = scene.add.text(0, 0, `${name}\nx:${content.x.toFixed(1)},y:${content.y.toFixed(1)}\nw:${object.displayWidth.toFixed(1)};h:${object.displayHeight.toFixed(1)}`, { 
            font: '40px Courier', 
            color: '#fc03e8',
            align: 'center'
        });
        debugText.setOrigin(0.5);
        const screenCentre: Phaser.Math.Vector2 = scene.cameras.main.getWorldPoint((scene.game.canvas.width / 2), (scene.game.canvas.height / 2));
        debugText.setPosition(screenCentre.x, screenCentre.y);
        debugText.setDepth(1000);
        debugText.setVisible(false);
        object.setInteractive().on(Phaser.Input.Events.POINTER_OVER, () => {
            debugText.setVisible(true);
        }, object).on(Phaser.Input.Events.POINTER_OUT, () => {
            debugText.setVisible(false);
        }, object);
    }

    export function isDarkColor(color: string): boolean {
        let isDark: number = 0;
        color = (color.startsWith('#')) ? color.slice(1) : color;
        for (var i=0; i<color.length; i++) {
            let c: string = color[i];
            if (['0','1','2','3','4','5','6','7'].includes(c)) {
                isDark++;
            }
        }
        return isDark >= Math.ceil(color.length / 2);
    }

    export function distance(p1: XY, p2: XY): number {
        const a = p1.x - p2.x;
        const b = p1.y - p2.y;
        return Math.hypot(a, b);
    }
}

export enum BetweenComparisonType {
    inclusive,
    exclusive,
    inclusiveStart,
    inclusiveEnd
}