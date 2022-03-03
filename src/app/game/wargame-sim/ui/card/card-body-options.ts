import { TextButtonOptions } from "../buttons/text-button-options";

export interface CardBodyOptions {
    scene?: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    title?: string;
    titleStyle?: Phaser.GameObjects.TextStyle;
    description?: string;
    descriptionStyle?: Phaser.GameObjects.TextStyle;
    buttons?: TextButtonOptions[];
    buttonSpacing?: number;
    backgroundColor?: number;
    cornerRadius?: number;
}