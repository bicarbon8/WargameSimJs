import { TextButtonOptions } from "../buttons/text-button-options";

export interface CardBodyOptions {
    scene?: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    title?: string;
    titleStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    description?: string;
    descriptionStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    buttons?: TextButtonOptions[];
    buttonSpacing?: number;
    backgroundColor?: number;
    cornerRadius?: number;
    debug?: boolean;
}