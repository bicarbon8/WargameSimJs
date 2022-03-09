export interface TextButtonOptions {
    scene?: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    text?: string;
    textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
    cornerRadius?: number;
    background?: Phaser.Types.GameObjects.Graphics.FillStyle;
    interactive?: boolean;
    padding?: number;
    debug?: boolean;
}