import { CardBodyOptions } from "./card-body-options";
import { CardHeaderOptions } from "./card-header-options";
import { CardImageOptions } from "./card-image-options";

export interface CardOptions {
    scene: Phaser.Scene;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    header?: CardHeaderOptions;
    image?: CardImageOptions;
    body?: CardBodyOptions;
    debug?: boolean;
}