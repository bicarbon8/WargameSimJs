import { MapManager } from "./map-manager";

export interface GameMapOptions {
    mapManager: MapManager;
    scene: Phaser.Scene;
    width?: number;
    height?: number;
    seed?: string;
    roomMinWidth?: number;
    roomMinHeight?: number;
    roomMaxWidth?: number;
    roomMaxHeight?: number;
    doorPadding?: number;
    maxRooms?: number;
    layerDepth?: number;
}