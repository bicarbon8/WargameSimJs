import { ButtonStyle } from "./button-style";

export interface TextButtonOptions {
    scene?: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    textSize?: number;
    buttonStyle?: ButtonStyle;
    cornerRadius?: number;
    interactive?: boolean;
    padding?: number;
    debug?: boolean;
}