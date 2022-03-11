import { PlayerManager } from "../players/player-manager";

export interface GameMapOptions {
    playerManager: PlayerManager;
    scene?: Phaser.Scene;
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