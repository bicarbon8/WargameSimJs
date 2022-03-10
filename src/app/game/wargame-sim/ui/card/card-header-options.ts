export interface CardHeaderOptions {
    scene?: Phaser.Scene,
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    background?: Phaser.Types.GameObjects.Graphics.FillStyle;
    cornerRadius?: number;
    debug?: boolean;
    padding?: number;
}