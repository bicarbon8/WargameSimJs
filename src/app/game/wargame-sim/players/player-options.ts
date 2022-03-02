import { PlayerStats } from "./player-stats";

export interface PlayerOptions {
    scene: Phaser.Scene;
    name: string;
    stats: PlayerStats;
}