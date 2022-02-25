import { MapTile } from "../../map/map-tile";

export interface UIGameMapOptions {
    scene: Phaser.Scene;
    layerDepth?: number;
    width?: number; // in number of tiles
    height?: number; // in number of tiles
    tiles?: MapTile[];
}