import { Alignment } from "./alignment";
import { LayoutContent } from "./layout-content";

export interface GridCellOptions {
    id?: string;
    scene?: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    alignment?: Alignment;
    scaleToFit?: boolean;
    keepAspectRatio?: boolean;
    backgroundColor?: number;
    backgroundAlpha?: number;
    border?: number;
    borderColor?: number;
    borderAlpha?: number;
    contents?: LayoutContent;
    debug?: boolean;
}