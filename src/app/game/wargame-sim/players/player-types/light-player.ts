import { BasePlayer } from "../base-player";
import { PlayerSpritesheetMappings } from "./player-spritesheet-mappings";

export class LightPlayer extends BasePlayer {
    constructor(scene: Phaser.Scene) {
        super({
            name: 'light',
            spriteMapping: PlayerSpritesheetMappings.light,
            scene: scene,
            stats: {
                mele: 1,
                ranged: 1,
                strength: 2,
                defense: 2,
                attacks: 1,
                wounds: 1,
                courage: 1,
                might: 0,
                will: 0,
                fate: 0,
                move: 7,
                shoot: 14,
                cost: 10
            }
        });
    }
}