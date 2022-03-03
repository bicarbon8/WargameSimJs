import { BasePlayer } from "../base-player";
import { PlayerSpritesheetMappings } from "./player-spritesheet-mappings";

export class BasicPlayer extends BasePlayer {
    protected readonly _index: number = 1;

    constructor(scene: Phaser.Scene) {
        super({
            name: 'basic',
            spriteMapping: PlayerSpritesheetMappings.basic,
            scene: scene,
            stats: {
                mele: 3,
                ranged: 5,
                strength: 3,
                defense: 5,
                attacks: 1,
                wounds: 2,
                courage: 3,
                might: 0,
                will: 0,
                fate: 0,
                move: 5,
                shoot: 10,
                cost: 15
            }
        });
    }
}