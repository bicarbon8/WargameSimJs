import { Alignment } from "./alignment";
import { GridLayout } from "./grid-layout";
import { LayoutContent } from "./layout-content";

export interface GridCellOptions {
    scene?: Phaser.Scene;
    gridLayout?: GridLayout;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    row?: number;
    column?: number;
    padding?: number;
    alignment?: Alignment;
    scaleToFit?: boolean;
    keepAspectRatio?: boolean;
    style?: Phaser.Types.GameObjects.Graphics.Styles,
    content?: LayoutContent;
    debug?: boolean;
}