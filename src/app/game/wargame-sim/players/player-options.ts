import { PlayerStats } from "./player-stats";
import { PlayerSpritesheetMapping } from "./player-types/player-spritesheet-mappings";

export interface PlayerOptions {
    scene: Phaser.Scene;
    name: string;
    spriteMapping: PlayerSpritesheetMapping;
    stats: PlayerStats;
}