import { PlayerStats } from "./player-stats";
import { PlayerSpritesheetMapping } from "./player-spritesheet-mappings";
import { PlayerManager } from "./player-manager";

export interface PlayerOptions {
    name: string;
    spriteMapping: PlayerSpritesheetMapping;
    stats: PlayerStats;
    scene?: Phaser.Scene;
    playerManager?: PlayerManager;
}